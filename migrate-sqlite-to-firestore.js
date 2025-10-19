/**
 * SQLite to Firestore Migration Script
 * 
 * This script migrates data from SQLite3 database to Firebase Firestore
 * 
 * Usage:
 *   node migrate-sqlite-to-firestore.js
 * 
 * Options:
 *   --dry-run     Show what would be migrated without actually migrating
 *   --backup      Create a JSON backup of SQLite data before migration
 *   --collections Specify collections to migrate (comma-separated)
 * 
 * Example:
 *   node migrate-sqlite-to-firestore.js --dry-run
 *   node migrate-sqlite-to-firestore.js --backup
 *   node migrate-sqlite-to-firestore.js --collections=users,pets
 */

const sqlite3 = require('sqlite3').verbose();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldBackup = args.includes('--backup');
const collectionsArg = args.find(arg => arg.startsWith('--collections='));
const selectedCollections = collectionsArg 
  ? collectionsArg.split('=')[1].split(',')
  : null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✖${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Initialize Firebase Admin
try {
  // Try to read service account key (you'll need to download this from Firebase Console)
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    log.success('Firebase Admin initialized with service account');
  } else {
    // Use application default credentials
    admin.initializeApp();
    log.success('Firebase Admin initialized with default credentials');
  }
} catch (error) {
  log.error('Failed to initialize Firebase Admin: ' + error.message);
  log.warning('Make sure you have set up Firebase credentials:');
  log.info('  1. Download service account key from Firebase Console');
  log.info('  2. Save it as firebase-service-account.json in the project root');
  log.info('  OR set GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

const db = admin.firestore();
const sqlite = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    log.error('Error opening SQLite database: ' + err.message);
    process.exit(1);
  }
  log.success('Connected to SQLite database');
});

// Promisify SQLite methods
const sqliteAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqlite.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Migration statistics
const stats = {
  users: { total: 0, migrated: 0, errors: 0 },
  pets: { total: 0, migrated: 0, errors: 0 },
  providers: { total: 0, migrated: 0, errors: 0 },
  services: { total: 0, migrated: 0, errors: 0 },
  bookings: { total: 0, migrated: 0, errors: 0 },
  payments: { total: 0, migrated: 0, errors: 0 },
  clinics: { total: 0, migrated: 0, errors: 0 }
};

/**
 * Create backup of SQLite data
 */
async function createBackup() {
  log.title('📦 Creating Backup');
  
  const backup = {
    timestamp: new Date().toISOString(),
    users: await sqliteAll('SELECT * FROM users'),
    pets: await sqliteAll('SELECT * FROM pets'),
    provider_profiles: await sqliteAll('SELECT * FROM provider_profiles'),
    services: await sqliteAll('SELECT * FROM services'),
    bookings: await sqliteAll('SELECT * FROM bookings'),
    payments: await sqliteAll('SELECT * FROM payments'),
    clinics: await sqliteAll('SELECT * FROM clinics'),
    clinic_services: await sqliteAll('SELECT * FROM clinic_services')
  };
  
  const backupFile = `sqlite-backup-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
  log.success(`Backup created: ${backupFile}`);
  
  return backup;
}

/**
 * Migrate Users (Pet Owners and Providers)
 */
async function migrateUsers() {
  log.title('👥 Migrating Users');
  
  const users = await sqliteAll('SELECT * FROM users');
  stats.users.total = users.length;
  
  log.info(`Found ${users.length} users to migrate`);
  
  if (isDryRun) {
    log.warning('DRY RUN: Would migrate users');
    users.slice(0, 3).forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.account_type}`);
    });
    if (users.length > 3) log.info(`  ... and ${users.length - 3} more`);
    return;
  }
  
  const batch = db.batch();
  let batchCount = 0;
  const batchLimit = 500; // Firestore batch limit
  
  for (const user of users) {
    try {
      // Get provider profile if exists
      let providerProfile = null;
      if (user.account_type === 'serviceProvider') {
        const profiles = await sqliteAll(
          'SELECT * FROM provider_profiles WHERE provider_id = ?',
          [user.id]
        );
        providerProfile = profiles[0] || null;
      }
      
      const userData = {
        uid: `user_${user.id}`, // Preserve original ID as reference
        originalId: user.id,
        name: user.name,
        email: user.email,
        role: user.account_type === 'serviceProvider' ? 'provider' : 'user',
        accountType: user.account_type || 'petOwner',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        profileComplete: true
      };
      
      // Add provider-specific fields
      if (providerProfile) {
        userData.phone = providerProfile.phone || '';
        userData.address = providerProfile.address || '';
        userData.bio = providerProfile.bio || '';
        userData.location = providerProfile.latitude && providerProfile.longitude
          ? {
              latitude: providerProfile.latitude,
              longitude: providerProfile.longitude
            }
          : null;
        userData.businessHours = providerProfile.business_hours
          ? JSON.parse(providerProfile.business_hours)
          : null;
      }
      
      const docRef = db.collection('users').doc(`user_${user.id}`);
      batch.set(docRef, userData);
      
      batchCount++;
      
      // Commit batch if reaching limit
      if (batchCount >= batchLimit) {
        await batch.commit();
        log.info(`Committed batch of ${batchCount} users`);
        batchCount = 0;
      }
      
      stats.users.migrated++;
    } catch (error) {
      log.error(`Error migrating user ${user.id}: ${error.message}`);
      stats.users.errors++;
    }
  }
  
  // Commit remaining batch
  if (batchCount > 0) {
    await batch.commit();
    log.info(`Committed final batch of ${batchCount} users`);
  }
  
  log.success(`Migrated ${stats.users.migrated}/${stats.users.total} users`);
}

/**
 * Migrate Pets
 */
async function migratePets() {
  log.title('🐾 Migrating Pets');
  
  const pets = await sqliteAll('SELECT * FROM pets');
  stats.pets.total = pets.length;
  
  log.info(`Found ${pets.length} pets to migrate`);
  
  if (isDryRun) {
    log.warning('DRY RUN: Would migrate pets');
    pets.slice(0, 3).forEach(pet => {
      console.log(`  - ${pet.name} (${pet.type}) - Owner ID: ${pet.owner_id}`);
    });
    if (pets.length > 3) log.info(`  ... and ${pets.length - 3} more`);
    return;
  }
  
  const batch = db.batch();
  let batchCount = 0;
  const batchLimit = 500;
  
  for (const pet of pets) {
    try {
      const petData = {
        originalId: pet.id,
        ownerId: `user_${pet.owner_id}`,
        name: pet.name,
        type: pet.type,
        breed: pet.breed || '',
        age: pet.age || null,
        gender: pet.gender || '',
        weight: pet.weight || null,
        notes: pet.notes || '',
        imageUrl: '', // Will be updated when images are uploaded
        gpsLocation: null, // Will be updated from Realtime Database
        createdAt: pet.created_at 
          ? admin.firestore.Timestamp.fromDate(new Date(pet.created_at))
          : admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = db.collection('pets').doc(`pet_${pet.id}`);
      batch.set(docRef, petData);
      
      batchCount++;
      
      if (batchCount >= batchLimit) {
        await batch.commit();
        log.info(`Committed batch of ${batchCount} pets`);
        batchCount = 0;
      }
      
      stats.pets.migrated++;
    } catch (error) {
      log.error(`Error migrating pet ${pet.id}: ${error.message}`);
      stats.pets.errors++;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    log.info(`Committed final batch of ${batchCount} pets`);
  }
  
  log.success(`Migrated ${stats.pets.migrated}/${stats.pets.total} pets`);
}

/**
 * Migrate Services
 */
async function migrateServices() {
  log.title('💼 Migrating Services');
  
  const services = await sqliteAll('SELECT * FROM services');
  stats.services.total = services.length;
  
  log.info(`Found ${services.length} services to migrate`);
  
  if (isDryRun) {
    log.warning('DRY RUN: Would migrate services');
    services.slice(0, 3).forEach(service => {
      console.log(`  - ${service.name} - $${service.price} (Provider ID: ${service.provider_id})`);
    });
    if (services.length > 3) log.info(`  ... and ${services.length - 3} more`);
    return;
  }
  
  const batch = db.batch();
  let batchCount = 0;
  const batchLimit = 500;
  
  for (const service of services) {
    try {
      const serviceData = {
        originalId: service.id,
        providerId: `user_${service.provider_id}`,
        name: service.name,
        description: service.description || '',
        price: service.price,
        category: categorizeService(service.name),
        rating: 0,
        reviewCount: 0,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = db.collection('services').doc(`service_${service.id}`);
      batch.set(docRef, serviceData);
      
      batchCount++;
      
      if (batchCount >= batchLimit) {
        await batch.commit();
        log.info(`Committed batch of ${batchCount} services`);
        batchCount = 0;
      }
      
      stats.services.migrated++;
    } catch (error) {
      log.error(`Error migrating service ${service.id}: ${error.message}`);
      stats.services.errors++;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    log.info(`Committed final batch of ${batchCount} services`);
  }
  
  log.success(`Migrated ${stats.services.migrated}/${stats.services.total} services`);
}

/**
 * Migrate Bookings
 */
async function migrateBookings() {
  log.title('📅 Migrating Bookings');
  
  const bookings = await sqliteAll('SELECT * FROM bookings');
  stats.bookings.total = bookings.length;
  
  log.info(`Found ${bookings.length} bookings to migrate`);
  
  if (isDryRun) {
    log.warning('DRY RUN: Would migrate bookings');
    bookings.slice(0, 3).forEach(booking => {
      console.log(`  - Booking #${booking.id} - ${booking.booking_date} (${booking.status})`);
    });
    if (bookings.length > 3) log.info(`  ... and ${bookings.length - 3} more`);
    return;
  }
  
  const batch = db.batch();
  let batchCount = 0;
  const batchLimit = 500;
  
  for (const booking of bookings) {
    try {
      // Get service details to get provider ID
      const services = await sqliteAll(
        'SELECT provider_id FROM services WHERE id = ?',
        [booking.service_id]
      );
      const providerId = services[0]?.provider_id;
      
      const bookingData = {
        originalId: booking.id,
        userId: `user_${booking.pet_owner_id}`,
        providerId: providerId ? `user_${providerId}` : null,
        serviceId: `service_${booking.service_id}`,
        petId: `pet_${booking.pet_id}`,
        bookingDate: booking.booking_date,
        status: booking.status || 'pending',
        paymentStatus: booking.payment_status || 'unpaid',
        stripeSessionId: booking.stripe_session_id || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = db.collection('bookings').doc(`booking_${booking.id}`);
      batch.set(docRef, bookingData);
      
      batchCount++;
      
      if (batchCount >= batchLimit) {
        await batch.commit();
        log.info(`Committed batch of ${batchCount} bookings`);
        batchCount = 0;
      }
      
      stats.bookings.migrated++;
    } catch (error) {
      log.error(`Error migrating booking ${booking.id}: ${error.message}`);
      stats.bookings.errors++;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    log.info(`Committed final batch of ${batchCount} bookings`);
  }
  
  log.success(`Migrated ${stats.bookings.migrated}/${stats.bookings.total} bookings`);
}

/**
 * Migrate Payments
 */
async function migratePayments() {
  log.title('💳 Migrating Payments');
  
  const payments = await sqliteAll('SELECT * FROM payments');
  stats.payments.total = payments.length;
  
  log.info(`Found ${payments.length} payments to migrate`);
  
  if (isDryRun) {
    log.warning('DRY RUN: Would migrate payments');
    payments.slice(0, 3).forEach(payment => {
      console.log(`  - Payment #${payment.id} - $${payment.amount/100} (${payment.status})`);
    });
    if (payments.length > 3) log.info(`  ... and ${payments.length - 3} more`);
    return;
  }
  
  const batch = db.batch();
  let batchCount = 0;
  const batchLimit = 500;
  
  for (const payment of payments) {
    try {
      const paymentData = {
        originalId: payment.id,
        stripeSessionId: payment.stripe_session_id,
        userId: payment.user_id ? `user_${payment.user_id}` : null,
        serviceId: payment.service_id ? `service_${payment.service_id}` : null,
        serviceName: payment.service_name || '',
        amount: payment.amount,
        currency: payment.currency || 'usd',
        status: payment.status || 'pending',
        createdAt: payment.created_at
          ? admin.firestore.Timestamp.fromDate(new Date(payment.created_at))
          : admin.firestore.FieldValue.serverTimestamp(),
        completedAt: payment.completed_at
          ? admin.firestore.Timestamp.fromDate(new Date(payment.completed_at))
          : null
      };
      
      const docRef = db.collection('payments').doc(`payment_${payment.id}`);
      batch.set(docRef, paymentData);
      
      batchCount++;
      
      if (batchCount >= batchLimit) {
        await batch.commit();
        log.info(`Committed batch of ${batchCount} payments`);
        batchCount = 0;
      }
      
      stats.payments.migrated++;
    } catch (error) {
      log.error(`Error migrating payment ${payment.id}: ${error.message}`);
      stats.payments.errors++;
    }
  }
  
  if (batchCount > 0) {
    await batch.commit();
    log.info(`Committed final batch of ${batchCount} payments`);
  }
  
  log.success(`Migrated ${stats.payments.migrated}/${stats.payments.total} payments`);
}

/**
 * Helper: Categorize service based on name
 */
function categorizeService(serviceName) {
  const name = serviceName.toLowerCase();
  if (name.includes('grooming') || name.includes('bath') || name.includes('nail')) {
    return 'grooming';
  } else if (name.includes('vet') || name.includes('check') || name.includes('dental')) {
    return 'veterinary';
  } else if (name.includes('training') || name.includes('obedience')) {
    return 'training';
  } else if (name.includes('boarding') || name.includes('sitting')) {
    return 'boarding';
  }
  return 'other';
}

/**
 * Print Migration Summary
 */
function printSummary() {
  log.title('📊 Migration Summary');
  
  const totalProcessed = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
  const totalMigrated = Object.values(stats).reduce((sum, s) => sum + s.migrated, 0);
  const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);
  
  console.log(`${colors.bright}Total Records:${colors.reset}`);
  console.log(`  Processed: ${totalProcessed}`);
  console.log(`  Migrated:  ${colors.green}${totalMigrated}${colors.reset}`);
  console.log(`  Errors:    ${totalErrors > 0 ? colors.red : colors.green}${totalErrors}${colors.reset}`);
  console.log('');
  
  console.log(`${colors.bright}By Collection:${colors.reset}`);
  Object.entries(stats).forEach(([collection, stat]) => {
    if (stat.total > 0) {
      const percentage = ((stat.migrated / stat.total) * 100).toFixed(1);
      console.log(`  ${collection.padEnd(15)} ${stat.migrated}/${stat.total} (${percentage}%) ${stat.errors > 0 ? colors.red + `[${stat.errors} errors]` + colors.reset : ''}`);
    }
  });
  
  if (isDryRun) {
    log.warning('\n⚠️  This was a DRY RUN - no data was actually migrated');
    log.info('Run without --dry-run flag to perform actual migration');
  }
}

/**
 * Main Migration Function
 */
async function main() {
  try {
    log.title('🚀 SQLite to Firestore Migration');
    
    if (isDryRun) {
      log.warning('Running in DRY RUN mode - no data will be migrated');
    }
    
    if (shouldBackup && !isDryRun) {
      await createBackup();
    }
    
    // Determine which collections to migrate
    const collectionsToMigrate = selectedCollections || [
      'users', 'pets', 'services', 'bookings', 'payments'
    ];
    
    log.info(`Migrating collections: ${collectionsToMigrate.join(', ')}`);
    console.log('');
    
    // Migrate in order (to maintain referential integrity)
    if (!selectedCollections || collectionsToMigrate.includes('users')) {
      await migrateUsers();
    }
    
    if (!selectedCollections || collectionsToMigrate.includes('pets')) {
      await migratePets();
    }
    
    if (!selectedCollections || collectionsToMigrate.includes('services')) {
      await migrateServices();
    }
    
    if (!selectedCollections || collectionsToMigrate.includes('bookings')) {
      await migrateBookings();
    }
    
    if (!selectedCollections || collectionsToMigrate.includes('payments')) {
      await migratePayments();
    }
    
    printSummary();
    
    if (!isDryRun) {
      log.success('\n✨ Migration completed successfully!');
      log.info('Next steps:');
      log.info('  1. Verify data in Firebase Console');
      log.info('  2. Update your backend to use Firestore');
      log.info('  3. Test your application thoroughly');
      log.info('  4. Keep SQLite backup for rollback if needed');
    }
    
  } catch (error) {
    log.error('Migration failed: ' + error.message);
    console.error(error);
    process.exit(1);
  } finally {
    sqlite.close();
    process.exit(0);
  }
}

// Run migration
main();

