const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('Connected to SQLite database for seeding');
});

// Insert sample data
db.serialize(() => {
  // Drop existing tables
  db.run('DROP TABLE IF EXISTS bookings', (err) => {
    if (err) console.error('Error dropping bookings table:', err.message);
  });
  
  db.run('DROP TABLE IF EXISTS provider_profiles', (err) => {
    if (err) console.error('Error dropping provider_profiles table:', err.message);
  });
  
  db.run('DROP TABLE IF EXISTS services', (err) => {
    if (err) console.error('Error dropping services table:', err.message);
  });
  
  db.run('DROP TABLE IF EXISTS pets', (err) => {
    if (err) console.error('Error dropping pets table:', err.message);
  });
  
  db.run('DROP TABLE IF EXISTS users', (err) => {
    if (err) console.error('Error dropping users table:', err.message);
  });
  
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    account_type TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created successfully');
    }
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    breed TEXT,
    age INTEGER,
    FOREIGN KEY (owner_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating pets table:', err.message);
    } else {
      console.log('Pets table created successfully');
    }
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    FOREIGN KEY (provider_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating services table:', err.message);
    } else {
      console.log('Services table created successfully');
    }
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_owner_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (pet_owner_id) REFERENCES users (id),
    FOREIGN KEY (service_id) REFERENCES services (id),
    FOREIGN KEY (pet_id) REFERENCES pets (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating bookings table:', err.message);
    } else {
      console.log('Bookings table created successfully');
    }
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS provider_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    bio TEXT,
    business_hours TEXT,
    FOREIGN KEY (provider_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating provider_profiles table:', err.message);
    } else {
      console.log('Provider profiles table created successfully');
    }
  });

  // Insert users - make sure we have distinct pet owners and service providers
  db.run(`INSERT INTO users (name, email, password, account_type) VALUES 
    ('adan chug', 'provider@test.com', 'test123', 'serviceProvider'),
    ('Shayan Karim', 'owner@test.com', 'test123', 'petOwner'),
    ('Alex Provider', 'alex@provider.com', 'test123', 'serviceProvider')`, (err) => {
    if (err) {
      console.error('Error inserting users:', err.message);
      return;
    }
    
    // Insert pets
    db.run(`INSERT INTO pets (owner_id, name, type, breed, age) VALUES 
      (2, 'Max', 'Dog', 'Golden Retriever', 3),
      (2, 'Buddy', 'Dog', 'Labrador', 2)`, (err) => {
      if (err) {
        console.error('Error inserting pets:', err.message);
        return;
      }
      
      // Insert services - assign to correct providers
      db.run(`INSERT INTO services (provider_id, name, description, price) VALUES 
        (1, 'Basic Grooming', 'Bath, brush, and nail trim for your pet', 50.00),
        (1, 'Full Grooming', 'Complete grooming package including haircut', 80.00),
        (1, 'Premium Grooming', 'Luxury grooming with special shampoo and conditioning', 120.00),
        (3, 'Dog Walking', 'Professional dog walking service', 25.00),
        (3, 'Pet Sitting', 'In-home pet sitting service', 40.00),
        (3, 'Dog Training', 'Basic obedience training for dogs', 60.00)`, (err) => {
        if (err) {
          console.error('Error inserting services:', err.message);
          return;
        }
        
        // Insert bookings with correct relationships
        db.run(`INSERT INTO bookings (pet_owner_id, service_id, pet_id, booking_date, status) VALUES 
          (2, 1, 1, '2024-03-21', 'confirmed'),
          (2, 2, 2, '2024-03-22', 'pending'),
          (2, 3, 2, '2024-03-20', 'cancelled'),
          (2, 3, 2, '2024-03-20', 'confirmed'),
          (2, 1, 1, '2024-03-21', 'pending')`, (err) => {
          if (err) {
            console.error('Error inserting bookings:', err.message);
            return;
          }
          
          // Insert provider profiles
          const businessHours = JSON.stringify({
            monday: { open: "09:00", close: "17:00", isOpen: true },
            tuesday: { open: "09:00", close: "17:00", isOpen: true },
            wednesday: { open: "09:00", close: "17:00", isOpen: true },
            thursday: { open: "09:00", close: "17:00", isOpen: true },
            friday: { open: "09:00", close: "17:00", isOpen: true },
            saturday: { open: "10:00", close: "15:00", isOpen: true },
            sunday: { open: "10:00", close: "15:00", isOpen: false }
          });
          
          db.run(`INSERT INTO provider_profiles (provider_id, phone, address, bio, business_hours) VALUES 
            (1, '+1 (555) 123-4567', '123 Pet Street, Animalville, AP 12345', 'Professional pet care provider with over 5 years of experience.', ?),
            (3, '+1 (555) 987-6543', '456 Walker Ave, Animalville, AP 12345', 'Professional dog walker and pet sitter with 3 years of experience.', ?)`, 
            [businessHours, businessHours], (err) => {
            if (err) {
              console.error('Error inserting provider profiles:', err.message);
              return;
            }
            
            console.log('All seed data inserted successfully');
            
            // Close database connection
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
              } else {
                console.log('Database seeded successfully and connection closed');
              }
            });
          });
        });
      });
    });
  });
}); 