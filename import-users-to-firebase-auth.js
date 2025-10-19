/**
 * Import Users from SQLite to Firebase Authentication
 * 
 * This script imports user accounts from SQLite into Firebase Auth
 * Users will need to reset their passwords using "Forgot Password"
 * 
 * Usage: node import-users-to-firebase-auth.js
 */

const sqlite3 = require('sqlite3').verbose();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

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
  const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    log.success('Firebase Admin initialized');
  } else {
    log.error('firebase-service-account.json not found!');
    process.exit(1);
  }
} catch (error) {
  log.error('Failed to initialize Firebase Admin: ' + error.message);
  process.exit(1);
}

// Connect to SQLite
const sqlite = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    log.error('Error opening SQLite database: ' + err.message);
    process.exit(1);
  }
  log.success('Connected to SQLite database');
});

// Promisify SQLite
const sqliteAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqlite.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/**
 * Import users to Firebase Authentication
 */
async function importUsers() {
  log.title('🔐 Importing Users to Firebase Authentication');
  
  try {
    // Get all users from SQLite
    const users = await sqliteAll('SELECT * FROM users');
    log.info(`Found ${users.length} users in SQLite`);
    
    const results = {
      total: users.length,
      imported: 0,
      alreadyExists: 0,
      errors: 0,
      errorDetails: []
    };
    
    for (const user of users) {
      try {
        log.info(`Processing: ${user.email}...`);
        
        // Check if user already exists in Firebase Auth
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUserByEmail(user.email);
          log.warning(`  ⚠️  Already exists in Firebase Auth`);
          results.alreadyExists++;
          
          // Update their Firestore document to match Firebase Auth UID
          const db = admin.firestore();
          await db.collection('users').doc(firebaseUser.uid).set({
            uid: firebaseUser.uid,
            originalId: user.id,
            email: user.email,
            name: user.name,
            role: user.account_type || 'petOwner',
            accountType: user.account_type || 'petOwner',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            profileComplete: true
          }, { merge: true });
          
          continue;
        } catch (error) {
          if (error.code !== 'auth/user-not-found') {
            throw error;
          }
        }
        
        // Create user in Firebase Auth with a temporary password
        // They will need to use "Forgot Password" to set their own password
        const tempPassword = `TempPass${Math.random().toString(36).slice(2)}!`;
        
        const newUser = await admin.auth().createUser({
          email: user.email,
          emailVerified: false,
          password: tempPassword,
          displayName: user.name,
          disabled: false
        });
        
        log.success(`  ✓ Created in Firebase Auth: ${newUser.uid}`);
        
        // Create/Update Firestore document
        const db = admin.firestore();
        await db.collection('users').doc(newUser.uid).set({
          uid: newUser.uid,
          originalId: user.id,
          email: user.email,
          name: user.name,
          role: user.account_type || 'petOwner',
          accountType: user.account_type || 'petOwner',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          profileComplete: true,
          needsPasswordReset: true
        });
        
        log.success(`  ✓ Created Firestore document`);
        
        // Optional: Send password reset email
        try {
          const resetLink = await admin.auth().generatePasswordResetLink(user.email);
          log.success(`  ✓ Password reset link: ${resetLink}`);
          log.warning(`  → User must reset password at: ${resetLink}`);
        } catch (resetError) {
          log.warning(`  ⚠️  Could not generate reset link: ${resetError.message}`);
        }
        
        results.imported++;
        
      } catch (error) {
        log.error(`  ✖ Error importing ${user.email}: ${error.message}`);
        results.errors++;
        results.errorDetails.push({
          email: user.email,
          error: error.message
        });
      }
    }
    
    // Print summary
    log.title('📊 Import Summary');
    console.log(`Total Users:       ${results.total}`);
    console.log(`✓ Imported:        ${colors.green}${results.imported}${colors.reset}`);
    console.log(`⚠️  Already Existed: ${colors.yellow}${results.alreadyExists}${colors.reset}`);
    console.log(`✖ Errors:          ${results.errors > 0 ? colors.red : colors.green}${results.errors}${colors.reset}`);
    
    if (results.errorDetails.length > 0) {
      console.log('\nErrors:');
      results.errorDetails.forEach(e => {
        console.log(`  - ${e.email}: ${e.error}`);
      });
    }
    
    log.title('🎉 Import Complete!');
    log.warning('\n⚠️  IMPORTANT NEXT STEPS:');
    log.info('1. Users need to reset their passwords using "Forgot Password"');
    log.info('2. Or you can send them the password reset links shown above');
    log.info('3. Test login with one of the imported accounts');
    
  } catch (error) {
    log.error('Import failed: ' + error.message);
    console.error(error);
    process.exit(1);
  } finally {
    sqlite.close();
    process.exit(0);
  }
}

// Run import
importUsers();

