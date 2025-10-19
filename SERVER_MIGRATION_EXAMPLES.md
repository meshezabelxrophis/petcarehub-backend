# Server Routes Migration Examples

This document shows how to convert your Express routes from SQLite to Firestore.

## 🔄 Conversion Pattern

### General Pattern

```javascript
// ❌ OLD (SQLite)
app.get('/api/resource', (req, res) => {
  db.all('SELECT * FROM table', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ NEW (Firestore)
const { ResourceService } = require('./services/firestoreService');

app.get('/api/resource', async (req, res) => {
  try {
    const resources = await ResourceService.getAll();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 📝 Example Conversions

### 1. User Routes

#### GET /api/users (Get All Users)

```javascript
// ❌ OLD (SQLite)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, account_type FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ NEW (Firestore)
const { UserService } = require('./services/firestoreService');

app.get('/api/users', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType || user.role
    }));
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### POST /api/users (Create User)

```javascript
// ❌ OLD (SQLite)
app.post('/api/users', (req, res) => {
  const { name, email, password, account_type } = req.body;
  
  db.run(
    'INSERT INTO users (name, email, password, account_type) VALUES (?, ?, ?, ?)', 
    [name, email, password, account_type || 'petOwner'], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        id: this.lastID, 
        name, 
        email,
        account_type 
      });
    }
  );
});

// ✅ NEW (Firestore)
const { UserService } = require('./services/firestoreService');

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, account_type, address, phone, bio } = req.body;
    
    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const userData = {
      name,
      email,
      password, // TODO: Hash password before storing
      role: account_type === 'serviceProvider' ? 'provider' : 'user',
      accountType: account_type || 'petOwner',
      profileComplete: false
    };
    
    // Add provider-specific fields
    if (account_type === 'serviceProvider') {
      userData.phone = phone || '';
      userData.address = address || '';
      userData.bio = bio || '';
    }
    
    const newUser = await UserService.createUser(userData);
    
    // Don't send password back
    delete newUser.password;
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### POST /api/login (User Login)

```javascript
// ❌ OLD (SQLite)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (user.password === password) {
      const { password, ...userData } = user;
      res.json(userData);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// ✅ NEW (Firestore)
const { UserService } = require('./services/firestoreService');

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await UserService.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // TODO: Use bcrypt to compare hashed passwords
    if (user.password === password) {
      // Don't send password back
      delete user.password;
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 2. Pet Routes

#### GET /api/pets (Get Pets by Owner)

```javascript
// ❌ OLD (SQLite)
app.get('/api/pets', (req, res) => {
  const ownerId = req.query.owner_id;
  
  if (!ownerId) {
    return res.status(400).json({ error: 'Owner ID is required' });
  }
  
  db.all('SELECT * FROM pets WHERE owner_id = ?', [ownerId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ NEW (Firestore)
const { PetService } = require('./services/firestoreService');

app.get('/api/pets', async (req, res) => {
  try {
    const ownerId = req.query.owner_id;
    
    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }
    
    // Convert ID format if needed (e.g., "1" -> "user_1")
    const ownerIdFormatted = ownerId.startsWith('user_') ? ownerId : `user_${ownerId}`;
    
    const pets = await PetService.getPetsByOwner(ownerIdFormatted);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### POST /api/pets (Create Pet)

```javascript
// ❌ OLD (SQLite)
app.post('/api/pets', (req, res) => {
  const { owner_id, name, type, breed, age, gender, weight, notes } = req.body;
  
  db.run(
    'INSERT INTO pets (owner_id, name, type, breed, age, gender, weight, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [owner_id, name, type, breed, age, gender, weight, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, owner_id, name, type });
    }
  );
});

// ✅ NEW (Firestore)
const { PetService } = require('./services/firestoreService');

app.post('/api/pets', async (req, res) => {
  try {
    const { owner_id, name, type, breed, age, gender, weight, notes } = req.body;
    
    if (!owner_id || !name || !type) {
      return res.status(400).json({ error: 'Owner ID, name, and type are required' });
    }
    
    // Convert ID format if needed
    const ownerIdFormatted = owner_id.startsWith('user_') ? owner_id : `user_${owner_id}`;
    
    const petData = {
      ownerId: ownerIdFormatted,
      name,
      type,
      breed: breed || '',
      age: age || null,
      gender: gender || 'Male',
      weight: weight || null,
      notes: notes || '',
      imageUrl: '',
      gpsLocation: null
    };
    
    const newPet = await PetService.createPet(petData);
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### DELETE /api/pets/:id (Delete Pet)

```javascript
// ❌ OLD (SQLite)
app.delete('/api/pets/:id', (req, res) => {
  const petId = req.params.id;
  
  db.run('DELETE FROM pets WHERE id = ?', [petId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Pet not found' });
    res.json({ success: true, message: 'Pet deleted successfully' });
  });
});

// ✅ NEW (Firestore)
const { PetService } = require('./services/firestoreService');

app.delete('/api/pets/:id', async (req, res) => {
  try {
    const petId = req.params.id;
    
    // Convert ID format if needed
    const petIdFormatted = petId.startsWith('pet_') ? petId : `pet_${petId}`;
    
    // Check if pet exists
    const pet = await PetService.getPetById(petIdFormatted);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    await PetService.deletePet(petIdFormatted);
    res.json({ 
      success: true, 
      message: 'Pet deleted successfully',
      deletedPet: pet
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 3. Service Routes

#### GET /api/services (Get All Services or by Provider)

```javascript
// ❌ OLD (SQLite)
app.get('/api/services', (req, res) => {
  const providerId = req.query.provider_id;
  
  if (providerId) {
    db.all(
      'SELECT * FROM services WHERE provider_id = ?',
      [providerId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } else {
    db.all('SELECT * FROM services', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// ✅ NEW (Firestore)
const { ServiceOffering } = require('./services/firestoreService');

app.get('/api/services', async (req, res) => {
  try {
    const providerId = req.query.provider_id;
    
    if (providerId) {
      // Convert ID format if needed
      const providerIdFormatted = providerId.startsWith('user_') 
        ? providerId 
        : `user_${providerId}`;
      
      const services = await ServiceOffering.getServicesByProvider(providerIdFormatted);
      res.json(services);
    } else {
      const services = await ServiceOffering.getAllServices();
      res.json(services);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 4. Booking Routes

#### POST /api/bookings (Create Booking)

```javascript
// ❌ OLD (SQLite)
app.post('/api/bookings', (req, res) => {
  const { pet_owner_id, service_id, pet_id, booking_date } = req.body;
  
  db.run(
    'INSERT INTO bookings (pet_owner_id, service_id, pet_id, booking_date, status) VALUES (?, ?, ?, ?, ?)',
    [pet_owner_id, service_id, pet_id, booking_date, 'pending'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, status: 'pending' });
    }
  );
});

// ✅ NEW (Firestore)
const { BookingService, ServiceOffering } = require('./services/firestoreService');

app.post('/api/bookings', async (req, res) => {
  try {
    const { pet_owner_id, service_id, pet_id, booking_date } = req.body;
    
    if (!pet_owner_id || !service_id || !pet_id || !booking_date) {
      return res.status(400).json({ error: 'All booking details are required' });
    }
    
    // Convert ID formats
    const userId = pet_owner_id.startsWith('user_') ? pet_owner_id : `user_${pet_owner_id}`;
    const serviceId = service_id.startsWith('service_') ? service_id : `service_${service_id}`;
    const petId = pet_id.startsWith('pet_') ? pet_id : `pet_${pet_id}`;
    
    // Get service to find provider
    const service = await ServiceOffering.getServiceById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const bookingData = {
      userId,
      providerId: service.providerId,
      serviceId,
      petId,
      bookingDate: booking_date,
      status: 'pending',
      paymentStatus: 'unpaid'
    };
    
    const newBooking = await BookingService.createBooking(bookingData);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### GET /api/bookings/pet-owner/:id (Get User's Bookings)

```javascript
// ❌ OLD (SQLite)
app.get('/api/bookings/pet-owner/:id', (req, res) => {
  const petOwnerId = req.params.id;
  
  db.all(`
    SELECT b.*, s.name as service_name, s.price
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    WHERE b.pet_owner_id = ?
    ORDER BY b.booking_date DESC
  `, [petOwnerId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ NEW (Firestore)
const { BookingService, ServiceOffering, PetService } = require('./services/firestoreService');

app.get('/api/bookings/pet-owner/:id', async (req, res) => {
  try {
    const petOwnerId = req.params.id;
    const userId = petOwnerId.startsWith('user_') ? petOwnerId : `user_${petOwnerId}`;
    
    const bookings = await BookingService.getBookingsByUser(userId);
    
    // Enrich bookings with service and pet details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const service = await ServiceOffering.getServiceById(booking.serviceId);
        const pet = await PetService.getPetById(booking.petId);
        
        return {
          ...booking,
          service_name: service?.name,
          price: service?.price,
          pet_name: pet?.name,
          pet_type: pet?.type
        };
      })
    );
    
    res.json(enrichedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔧 Helper Functions

### ID Conversion Helper

```javascript
/**
 * Convert between SQLite numeric IDs and Firestore string IDs
 */
const idHelpers = {
  toFirestore: (id, prefix) => {
    if (!id) return null;
    if (typeof id === 'string' && id.startsWith(prefix)) return id;
    return `${prefix}_${id}`;
  },
  
  fromFirestore: (id) => {
    if (!id) return null;
    if (typeof id === 'number') return id;
    return id.split('_')[1] || id;
  },
  
  // Specific converters
  userId: (id) => idHelpers.toFirestore(id, 'user'),
  petId: (id) => idHelpers.toFirestore(id, 'pet'),
  serviceId: (id) => idHelpers.toFirestore(id, 'service'),
  bookingId: (id) => idHelpers.toFirestore(id, 'booking'),
  paymentId: (id) => idHelpers.toFirestore(id, 'payment')
};

module.exports = idHelpers;
```

Usage:

```javascript
const idHelpers = require('./utils/idHelpers');

app.get('/api/pets', async (req, res) => {
  const ownerId = idHelpers.userId(req.query.owner_id);
  const pets = await PetService.getPetsByOwner(ownerId);
  res.json(pets);
});
```

---

## ⚠️ Important Notes

### 1. Async/Await

All Firestore operations are asynchronous. Convert callbacks to async/await:

```javascript
// ❌ OLD (Callbacks)
function(req, res) { }

// ✅ NEW (Async)
async function(req, res) { }
```

### 2. Error Handling

Use try/catch for all Firestore operations:

```javascript
try {
  const result = await FirestoreService.getSomething();
  res.json(result);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
}
```

### 3. Transaction Support

For operations requiring multiple writes:

```javascript
const { admin, db } = require('./config/firebaseAdmin');

app.post('/api/complex-operation', async (req, res) => {
  try {
    await db.runTransaction(async (transaction) => {
      // Read documents
      const userRef = db.collection('users').doc('user_1');
      const userDoc = await transaction.get(userRef);
      
      // Write documents
      transaction.update(userRef, { credits: userDoc.data().credits - 100 });
      transaction.set(db.collection('purchases').doc(), { userId: 'user_1', amount: 100 });
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Batch Writes

For multiple independent writes:

```javascript
const batch = db.batch();

users.forEach(user => {
  const ref = db.collection('users').doc(user.id);
  batch.set(ref, user);
});

await batch.commit();
```

---

## 📋 Migration Checklist

- [ ] Replace `require('sqlite3')` with Firestore service imports
- [ ] Convert all route callbacks to async functions
- [ ] Add try/catch error handling
- [ ] Update ID formats (numeric → string with prefix)
- [ ] Update foreign key references
- [ ] Remove `db.all`, `db.get`, `db.run` calls
- [ ] Test each route individually
- [ ] Update frontend to use new ID formats
- [ ] Remove SQLite database connection code
- [ ] Delete SQLite database file (after backup)

---

**Ready to migrate? Start with one collection and test thoroughly before moving to the next!** 🚀

