const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const pathOriginal = require('path');
const axios = require('axios');

// Firestore setup (replacing SQLite)
const { db: firestoreDb, realtimeDb } = require('./config/firebaseAdmin');
const NotificationService = require('./services/notificationService');
const {
  UserService,
  PetService,
  ServiceOffering,
  BookingService,
  PaymentService
} = require('./services/firestoreService');

const app = express();
const server = http.createServer(app);

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL || 'https://your-firebase-app.web.app',
      process.env.VERCEL_URL || 'https://your-vercel-app.vercel.app',
      'https://petcarehub-fyp.web.app', // Add your actual Firebase domain
      'https://petcarehub-fyp.firebaseapp.com'
    ]
  : ['http://localhost:3000', 'http://localhost:3001'];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 5001;

// Firestore is already initialized via firebaseAdmin
console.log('✅ Using Firestore for database operations');

// Keep for backwards compatibility (will be removed later)
const db = {
  serialize: (fn) => fn(),
  run: () => {},
  all: () => {},
  get: () => {}
};

// Database ready - using Firestore
console.log('✅ Firestore database ready - no table creation needed');

// CORS for frontend (development and production)
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Special middleware for Stripe webhooks (must be before express.json())
app.use('/api/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Import and use Stripe routes
const stripeRouter = require('./stripe');
app.use('/api', stripeRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);
  
  // Send current pet location to newly connected client
  console.log('📤 Sending current location to new client:', petLocationData);
  socket.emit('petLocationUpdate', {
    latitude: petLocationData.latitude,
    longitude: petLocationData.longitude,
    timestamp: petLocationData.timestamp
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// API: Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    // Format for backwards compatibility
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      account_type: user.accountType || user.role
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Add a user
app.post('/api/users', async (req, res) => {
  try {
  const { name, email, password, account_type, address, phone, bio, latitude, longitude } = req.body;
  
  console.log('Received registration request:', { name, email, account_type, address, phone, latitude, longitude });
  
    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    
    const userData = {
      name,
      email,
      password: password || null, // TODO: Hash password before storing
      role: account_type === 'serviceProvider' ? 'provider' : 'user',
      accountType: account_type || 'petOwner',
      profileComplete: false
    };
    
    // Add provider-specific fields
      if (account_type === 'serviceProvider' && (address || phone || bio || latitude || longitude)) {
        console.log('Creating provider profile for service provider');
        
      userData.phone = phone || '';
      userData.address = address || '';
      userData.bio = bio || '';
      userData.location = (latitude && longitude) ? {
        latitude,
        longitude
      } : null;
      userData.businessHours = {
          monday: { open: "09:00", close: "17:00", isOpen: true },
          tuesday: { open: "09:00", close: "17:00", isOpen: true },
          wednesday: { open: "09:00", close: "17:00", isOpen: true },
          thursday: { open: "09:00", close: "17:00", isOpen: true },
          friday: { open: "09:00", close: "17:00", isOpen: true },
          saturday: { open: "10:00", close: "15:00", isOpen: true },
          sunday: { open: "10:00", close: "15:00", isOpen: false }
      };
    }
    
    const newUser = await UserService.createUser(userData);
    console.log(`User created with ID: ${newUser.id}`);
            
            res.status(201).json({ 
      id: newUser.id, 
              name, 
              email,
              account_type: account_type || 'petOwner'
            });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// API: Login
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
    
    // In a real application, you would hash passwords and compare hashes
    // This is just for demonstration purposes
    if (user.password === password) {
      // Send user data without password
      const { password, createdAt, updatedAt, ...userData } = user;
      // Add account_type for backwards compatibility
      userData.account_type = user.accountType || user.role;
      res.json(userData);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
    }
});

// Pet Owner Routes

// Get all pets for a specific owner
app.get('/api/pets', async (req, res) => {
  try {
  const ownerId = req.query.owner_id;
    
    if (!ownerId) {
      return res.status(400).json({ error: 'Owner ID is required' });
    }
    
    const pets = await PetService.getPetsByOwner(ownerId);
    
    // Format for backwards compatibility
    const formattedPets = pets.map(pet => ({
      id: pet.id,
      owner_id: pet.ownerId,
      name: pet.name,
      type: pet.type || pet.species,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      weight: pet.weight,
      notes: pet.notes || pet.medicalHistory,
      image_url: pet.imageUrl
    }));
    
    res.json(formattedPets);
  } catch (error) {
    console.error('Error getting pets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new pet
app.post('/api/pets', async (req, res) => {
  try {
    const { owner_id, name, type, breed, age, gender, weight, notes, image_url } = req.body;
  
  if (!owner_id || !name || !type) {
    return res.status(400).json({ error: 'Owner ID, name and type are required' });
  }
  
    const petData = {
      ownerId: owner_id,
      name,
      species: type,
      breed: breed || '',
      age: age ? parseInt(age) : 0,
      gender: gender || 'Male',
      weight: weight ? parseFloat(weight) : 0,
      medicalHistory: notes || '',
      imageUrl: image_url || null
    };
    
    const newPet = await PetService.createPet(petData);
    
    console.log(`New pet added: ${name} (${type}) for owner ${owner_id}`);
    
    res.status(201).json({
      id: newPet.id,
      owner_id,
    name,
    type,
    breed: breed || null,
    age: age ? parseInt(age) : null,
      gender: gender || 'Male',
    weight: weight ? parseFloat(weight) : null,
      notes: notes || null,
      image_url: image_url || null
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update an existing pet
app.put('/api/pets/:id', async (req, res) => {
  try {
    const petId = req.params.id;
    const { name, type, breed, age, gender, weight, notes, image_url } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Pet name and type are required' });
  }
  
    const updateData = {
        name,
      species: type,
      breed: breed || '',
      age: age ? parseInt(age) : 0,
      gender: gender || 'Male',
      weight: weight ? parseFloat(weight) : 0,
      medicalHistory: notes || ''
    };
    
    if (image_url) {
      updateData.imageUrl = image_url;
    }
    
    await PetService.updatePet(petId, updateData);
    
  res.json({
    id: petId,
    name,
    type,
    breed: breed || null,
    age: age ? parseInt(age) : null,
      gender: gender || 'Male',
    weight: weight ? parseFloat(weight) : null,
    notes: notes || null,
      image_url: image_url || null,
    message: 'Pet updated successfully'
  });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a pet
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const petId = req.params.id;
  
  console.log(`Deleting pet with ID: ${petId}`);
  
    // Get pet before deleting
    const pet = await PetService.getPetById(petId);
    
    if (!pet) {
      console.log(`Pet with ID ${petId} not found`);
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    // Delete the pet
    await PetService.deletePet(petId);
    
    console.log(`Pet deleted: ${pet.name} (ID: ${petId})`);
    
    res.json({
          success: true,
          message: `Pet with ID ${petId} deleted successfully`,
      deletedPet: {
        id: pet.id,
        name: pet.name,
        type: pet.species
      }
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Service Provider Routes

// Get all services for a specific provider
app.post('/api/services', async (req, res) => {
  try {
    const { provider_id, name, description, price, category, duration } = req.body;
  
  if (!provider_id || !name || !price) {
    return res.status(400).json({ error: 'Provider ID, name and price are required' });
  }
  
    // Verify that the provider is actually a service provider
    const user = await UserService.getUserById(provider_id);
    
    if (!user || (user.accountType !== 'serviceProvider' && user.role !== 'provider')) {
      return res.status(400).json({ 
        error: 'Invalid provider ID. Services can only be created by service providers.' 
      });
    }
    
    // Create the service
    const serviceData = {
      providerId: provider_id,
      name,
      description: description || '',
      price: parseFloat(price),
      category: category || 'General',
      duration: duration || 60,
      isActive: true, // Mark service as active by default
      createdAt: new Date()
    };
    
    console.log(`✅ Creating service "${name}" for provider ${provider_id}`);
    const newService = await ServiceOffering.createService(serviceData);
    
        res.status(201).json({
      id: newService.id,
          provider_id,
          name,
      description: description || '',
      price,
      category: category || 'General',
      duration: duration || 60
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all services for a specific provider
app.get('/api/services', async (req, res) => {
  try {
  const providerId = req.query.provider_id;
  const providerName = req.query.provider_name;
    
    console.log(`📥 Fetching services - providerId: ${providerId}, providerName: ${providerName}`);
    
    let services;
  
  if (!providerId && !providerName) {
      // Return all services
      services = await ServiceOffering.getAllServices();
      console.log(`  ✅ Fetched ${services.length} total services`);
  } else if (providerName) {
      // Search by provider name
      const allServices = await ServiceOffering.getAllServices();
      services = allServices.filter(service => 
        service.provider_name && service.provider_name.toLowerCase().includes(providerName.toLowerCase())
      );
  } else {
      // Search by provider ID
      services = await ServiceOffering.getServicesByProvider(providerId);
    }
    
    // Format for backwards compatibility
    const formattedServices = services.map(service => ({
      id: service.id,
      provider_id: service.providerId,
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      provider_name: service.provider_name,
      account_type: 'serviceProvider',
      duration: service.duration,
      availability: service.availability
    }));
    
    res.json(formattedServices);
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({ error: error.message });
  }
});

// Utility endpoint to fix existing services (add isActive flag to all services)
app.post('/api/services/fix-active-flag', async (req, res) => {
  try {
    console.log('🔧 Fixing isActive flag for all services...');
    
    const allServices = await ServiceOffering.getAllServices();
    console.log(`  Found ${allServices.length} services`);
    
    let updatedCount = 0;
    for (const service of allServices) {
      if (service.isActive === undefined) {
        await ServiceOffering.updateService(service.id, { 
          isActive: true,
          createdAt: service.createdAt || new Date()
        });
        updatedCount++;
        console.log(`  ✅ Updated service: ${service.name} (${service.id})`);
      }
    }
    
    console.log(`✅ Fixed ${updatedCount} services`);
    res.json({ 
      message: `Successfully updated ${updatedCount} services with isActive flag`,
      totalServices: allServices.length,
      updatedServices: updatedCount
    });
  } catch (error) {
    console.error('❌ Error fixing services:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a service
app.delete('/api/services/:id', async (req, res) => {
  try {
  const serviceId = req.params.id;
  
  console.log(`Deleting service with ID: ${serviceId}`);
  
    // Check if service exists
    const service = await ServiceOffering.getServiceById(serviceId);
    
    if (!service) {
      console.log(`Service with ID ${serviceId} not found`);
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Delete the service
    await ServiceOffering.deleteService(serviceId);
      
      console.log(`Successfully deleted service with ID ${serviceId}`);
      res.json({
        success: true,
        message: `Service with ID ${serviceId} deleted successfully`,
        deletedService: service
      });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    
    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }
    
    const service = await ServiceOffering.getServiceById(serviceId);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Format for backwards compatibility
    const formattedService = {
      id: service.id,
      provider_id: service.providerId,
      name: service.name,
      description: service.description,
      price: service.price,
      category: service.category,
      duration: service.duration,
      availability: service.availability,
      provider_name: service.provider_name
    };
    
    res.json(formattedService);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: error.message });
  }
});

// Provider Profile Routes

// Get provider profile
app.get('/api/providers/:id/profile', async (req, res) => {
  try {
  const providerId = req.params.id;
  
    console.log(`📥 Getting provider profile for: ${providerId}`);
    
    const user = await UserService.getUserById(providerId);
    
    if (!user) {
      console.log(`  ⚠️ Provider not found: ${providerId}`);
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Return profile data from user document
    const profile = {
      provider_id: providerId,
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      business_hours: user.businessHours || {
        monday: { open: "09:00", close: "17:00", isOpen: true },
        tuesday: { open: "09:00", close: "17:00", isOpen: true },
        wednesday: { open: "09:00", close: "17:00", isOpen: true },
        thursday: { open: "09:00", close: "17:00", isOpen: true },
        friday: { open: "09:00", close: "17:00", isOpen: true },
        saturday: { open: "10:00", close: "15:00", isOpen: true },
        sunday: { open: "10:00", close: "15:00", isOpen: false }
      },
      latitude: user.location?.latitude || null,
      longitude: user.location?.longitude || null
      };
    
    console.log(`  ✅ Returning profile for: ${user.name}`);
    res.json(profile);
  } catch (error) {
    console.error('❌ Error fetching provider profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update provider profile
app.put('/api/providers/:id/profile', async (req, res) => {
  try {
  const providerId = req.params.id;
  const { phone, address, bio, businessHours, latitude, longitude } = req.body;
  
    console.log(`📥 Updating provider profile for: ${providerId}`);
    
    const user = await UserService.getUserById(providerId);
    
    if (!user) {
      console.log(`  ⚠️ Provider not found: ${providerId}`);
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Update user document with profile data
    const updateData = {
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(bio !== undefined && { bio }),
      ...(businessHours !== undefined && { businessHours })
    };
    
    // Handle location separately
    if (latitude !== undefined || longitude !== undefined) {
      updateData.location = {
        latitude: latitude !== undefined ? latitude : (user.location?.latitude || null),
        longitude: longitude !== undefined ? longitude : (user.location?.longitude || null)
      };
    }
    
    await UserService.updateUser(providerId, updateData);
    
    console.log(`  ✅ Profile updated for: ${user.name}`);
          
          res.json({
      provider_id: providerId,
      phone: updateData.phone || user.phone || '',
      address: updateData.address || user.address || '',
      bio: updateData.bio || user.bio || '',
      business_hours: updateData.businessHours || user.businessHours || {},
      latitude: updateData.location?.latitude || user.location?.latitude || null,
      longitude: updateData.location?.longitude || user.location?.longitude || null
    });
  } catch (error) {
    console.error('❌ Error updating provider profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Booking Routes

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { 
      pet_owner_id, 
      service_id, 
      pet_id, 
      pet_ids, 
      pet_names, 
      booking_date, 
      provider_id,
      total_price,
      base_price,
      number_of_pets
    } = req.body;
    
    console.log('📝 Creating new booking with data:', {
      pet_owner_id,
      service_id,
      pet_id,
      pet_ids,
      number_of_pets,
      booking_date
    });
    
    // IMPORTANT: If pet_ids is provided as an array with multiple pets,
    // we create ONE booking for ALL pets, NOT individual bookings
    if (pet_ids && Array.isArray(pet_ids) && pet_ids.length > 1) {
      console.log(`✅ Multi-pet booking detected: ${pet_ids.length} pets. Creating SINGLE booking.`);
    }
    
    if (!pet_owner_id || !service_id || !pet_id || !booking_date) {
      return res.status(400).json({ error: 'All booking details are required' });
    }
    
    // Get service details to verify it exists and get provider_id if not provided
    const service = await ServiceOffering.getServiceById(service_id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    const finalProviderId = provider_id || service.providerId;
    console.log(`Service ${service_id} is provided by provider ${finalProviderId}`);
    
    // Check for duplicate bookings (same user, service, date, and pets) within last 5 seconds
    // This prevents accidental double-submissions
    if (pet_ids && Array.isArray(pet_ids) && pet_ids.length > 0) {
      const recentBookings = await BookingService.getBookingsByUser(pet_owner_id);
      const fiveSecondsAgo = new Date(Date.now() - 5000);
      const duplicateCheck = recentBookings.find(b => 
        b.serviceId === service_id &&
        b.bookingDate === booking_date &&
        b.petIds && 
        Array.isArray(b.petIds) &&
        b.petIds.length === pet_ids.length &&
        b.petIds.every(id => pet_ids.includes(id)) &&
        new Date(b.createdAt?.toDate?.() || b.createdAt) > fiveSecondsAgo
      );
      
      if (duplicateCheck) {
        console.log(`⚠️  Duplicate booking detected! Returning existing booking ID: ${duplicateCheck.id}`);
        return res.status(200).json({
          id: duplicateCheck.id,
          message: 'Booking already exists (duplicate submission prevented)',
          ...duplicateCheck
        });
      }
    }
    
    // Create booking in Firestore
    const bookingData = {
      userId: pet_owner_id,
      serviceId: service_id,
      petId: pet_id,
      petIds: pet_ids || [pet_id], // Store array of pet IDs
      petNames: pet_names || [], // Store array of pet names
      providerId: finalProviderId,
      bookingDate: booking_date,
      scheduledDate: booking_date,
      status: 'pending',
      paymentStatus: 'pending',
      stripeSessionId: null,
      totalPrice: total_price || service.price, // Store calculated total price
      basePrice: base_price || service.price, // Store base service price
      numberOfPets: number_of_pets || 1 // Store number of pets
    };
    
    // IMPORTANT: Create ONLY ONE booking, even if pet_ids contains multiple pets
    const newBooking = await BookingService.createBooking(bookingData);
    console.log(`✅ Created SINGLE booking with ID ${newBooking.id} for ${number_of_pets || 1} pet(s)`);
    
    // Log warning if somehow multiple bookings are being created
    if (pet_ids && Array.isArray(pet_ids) && pet_ids.length > 1) {
      console.log(`⚠️  Multi-pet booking created. This should be ONE booking, not ${pet_ids.length} separate bookings.`);
    }
    
    // Get additional details for response
    const pet = await PetService.getPetById(pet_id);
    const owner = await UserService.getUserById(pet_owner_id);
    const provider = await UserService.getUserById(finalProviderId);
    
    // Return formatted booking details
    const bookingDetails = {
      id: newBooking.id,
      pet_owner_id: pet_owner_id,
      service_id: service_id,
      pet_id: pet_id,
      pet_ids: pet_ids || [pet_id],
      pet_names: pet_names || [pet?.name || 'Unknown Pet'],
      booking_date: booking_date,
      status: 'pending',
      payment_status: 'pending',
      service_name: service.name,
      price: service.price,
      total_price: total_price || service.price,
      base_price: base_price || service.price,
      number_of_pets: number_of_pets || 1,
      provider_id: finalProviderId,
      provider_name: provider?.name || 'Unknown Provider',
      pet_name: pet?.name || 'Unknown Pet',
      pet_type: pet?.species || null,
      pet_breed: pet?.breed || null,
      owner_name: owner?.name || 'Unknown Owner',
      message: 'Booking created successfully!'
    };
    
    console.log(`✅ New booking created: ${bookingDetails.owner_name} booked ${bookingDetails.service_name} with provider ${bookingDetails.provider_name} for ${number_of_pets || 1} pet(s)`);
    
    // Send notifications (async, don't wait)
    (async () => {
      try {
        // Notify pet owner that booking was created
        await NotificationService.notifyBookingConfirmed(
          pet_owner_id,
          service.name,
          booking_date
        );
        
        // Notify provider of new booking
        if (finalProviderId && owner) {
          const customerName = owner.name || owner.email || 'A customer';
          const petInfo = number_of_pets > 1 ? `${number_of_pets} pets` : '1 pet';
          await NotificationService.notifyProviderNewBooking(
            finalProviderId,
            customerName,
            `${service.name} (${petInfo})`,
            booking_date
          );
        }
      } catch (err) {
        console.error('⚠️  Error sending booking notifications:', err);
        // Don't fail the request if notifications fail
      }
    })();
    
    res.status(201).json(bookingDetails);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

// Get bookings for a pet owner
app.get('/api/bookings/pet-owner/:id', async (req, res) => {
  try {
  const petOwnerId = req.params.id;
  
  console.log(`Fetching bookings for pet owner ID: ${petOwnerId}`);
  
    const bookings = await BookingService.getBookingsByUser(petOwnerId);
    
    console.log(`Found ${bookings.length} bookings for pet owner ${petOwnerId}`);
    
    // Enrich bookings with related data
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const service = booking.serviceId ? await ServiceOffering.getServiceById(booking.serviceId) : null;
      const pet = booking.petId ? await PetService.getPetById(booking.petId) : null;
      const provider = service && service.providerId ? await UserService.getUserById(service.providerId) : null;
      
      return {
        id: booking.id,
        pet_owner_id: booking.userId,
        service_id: booking.serviceId,
        pet_id: booking.petId,
        pet_ids: booking.petIds || [booking.petId], // Multi-pet support
        pet_names: booking.petNames || [pet?.name || 'Unknown'], // Multi-pet names
        booking_date: booking.bookingDate || booking.scheduledDate,
        status: booking.status,
        payment_status: booking.paymentStatus,
        stripe_session_id: booking.stripeSessionId,
        service_name: service?.name || null,
        price: service?.price || null,
        total_price: booking.totalPrice || service?.price || null, // Total price for multi-pet
        base_price: booking.basePrice || service?.price || null, // Base price per pet
        number_of_pets: booking.numberOfPets || 1, // Number of pets in booking
        provider_id: service?.providerId || null,
        service_description: service?.description || null,
        pet_name: pet?.name || null,
        pet_type: pet?.species || null,
        pet_breed: pet?.breed || null,
        provider_name: provider?.name || null,
        provider_email: provider?.email || null
      };
    }));
    
    res.json(enrichedBookings);
  } catch (error) {
    console.error('Error fetching pet owner bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a service provider
app.get('/api/bookings/provider/:id', async (req, res) => {
  try {
  const providerId = req.params.id;
  
    console.log(`📥 Fetching bookings for provider ID: ${providerId}`);
    
    // Get all bookings
    console.log('  → Getting all bookings...');
    const allBookings = await BookingService.getAllBookings();
    console.log(`  ✓ Got ${allBookings.length} total bookings`);
    
    // Get provider's services to filter bookings
    console.log('  → Getting provider services...');
    const providerServices = await ServiceOffering.getServicesByProvider(providerId);
    console.log(`  ✓ Provider has ${providerServices.length} services`);
    const providerServiceIds = providerServices.map(s => s.id);
    
    // Filter bookings that belong to this provider
    // Check BOTH serviceId (primary) and providerId (fallback) to ensure we catch all bookings
    const providerBookings = allBookings.filter(booking => 
      providerServiceIds.includes(booking.serviceId) || booking.providerId === providerId
    );
    
    console.log(`  ✓ Found ${providerBookings.length} bookings for provider ${providerId}`);
    
    // Enrich bookings with related data
    console.log('  → Enriching bookings with related data...');
    const enrichedBookings = await Promise.all(providerBookings.map(async (booking) => {
      try {
        const service = booking.serviceId ? await ServiceOffering.getServiceById(booking.serviceId) : null;
        const pet = booking.petId ? await PetService.getPetById(booking.petId) : null;
        const owner = booking.userId ? await UserService.getUserById(booking.userId) : null;
        
        return {
          id: booking.id,
          pet_owner_id: booking.userId,
          service_id: booking.serviceId,
          pet_id: booking.petId,
          pet_ids: booking.petIds || [booking.petId], // Multi-pet support
          pet_names: booking.petNames || [pet?.name || 'Unknown'], // Multi-pet names
          booking_date: booking.bookingDate || booking.scheduledDate,
          status: booking.status,
          payment_status: booking.paymentStatus,
          stripe_session_id: booking.stripeSessionId,
          service_name: service?.name || null,
          price: service?.price || null,
          total_price: booking.totalPrice || service?.price || null, // Total price for multi-pet
          base_price: booking.basePrice || service?.price || null, // Base price per pet
          number_of_pets: booking.numberOfPets || 1, // Number of pets in booking
          provider_id: service?.providerId || providerId,
          pet_name: pet?.name || null,
          pet_type: pet?.species || null,
          pet_breed: pet?.breed || null,
          owner_name: owner?.name || null,
          owner_email: owner?.email || null
        };
      } catch (enrichError) {
        console.error(`  ⚠️ Error enriching booking ${booking.id}:`, enrichError.message);
        // Return booking with partial data if enrichment fails
        return {
          id: booking.id,
          pet_owner_id: booking.userId,
          service_id: booking.serviceId,
          pet_id: booking.petId,
          booking_date: booking.bookingDate || booking.scheduledDate,
          status: booking.status,
          payment_status: booking.paymentStatus,
          stripe_session_id: booking.stripeSessionId,
          service_name: null,
          price: null,
          provider_id: providerId,
          pet_name: null,
          pet_type: null,
          pet_breed: null,
          owner_name: null,
          owner_email: null
        };
      }
    }));
    
    console.log('  ✓ Enrichment complete');
    
    // Sort by booking date descending
    enrichedBookings.sort((a, b) => {
      const dateA = new Date(a.booking_date || 0);
      const dateB = new Date(b.booking_date || 0);
      return dateB - dateA;
    });
    
    console.log(`✅ Sending ${enrichedBookings.length} enriched bookings`);
    res.json(enrichedBookings);
  } catch (error) {
    console.error('❌ Error fetching provider bookings:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
app.put('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  
  console.log(`Updating booking ${bookingId} status to ${status}`);
  
  if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required (pending, confirmed, cancelled, completed)' });
  }
  
  try {
    // Get booking details before updating (for notifications)
    const booking = await BookingService.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update booking in Firestore
    const updated = await BookingService.updateBooking(bookingId, { status });
    
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Send notification when provider confirms booking
    if (status === 'confirmed' && booking.userId && booking.providerId) {
      (async () => {
        try {
          // Get provider details
          const provider = await UserService.getUserById(booking.providerId);
          const providerName = provider?.name || provider?.email || 'Provider';
          
          // Get service details
          const service = await ServiceOffering.getServiceById(booking.serviceId);
          const serviceName = service?.name || 'Service';
          
          // Notify pet owner that provider confirmed
          await NotificationService.notifyProviderConfirmedBooking(
            booking.userId,
            providerName,
            serviceName,
            booking.bookingDate || booking.scheduledDate
          );
        } catch (err) {
          console.error('⚠️  Error sending provider confirmation notification:', err);
          // Don't fail the request if notifications fail
        }
      })();
    }
    
    res.json({ 
      id: bookingId, 
      status,
      message: `Booking status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
app.delete('/api/bookings/:id', async (req, res) => {
  const bookingId = req.params.id;
  
  console.log(`Deleting booking with ID: ${bookingId}`);
  
  try {
    // Get booking before deletion
    const booking = await BookingService.getBookingById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Delete from Firestore
    const deleted = await BookingService.deleteBooking(bookingId);
    
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete booking' });
    }
    
    console.log(`Booking deleted from Firestore: ID ${bookingId}`);
    
    return res.json({
      success: true,
      message: `Booking with ID ${bookingId} deleted successfully`,
      deletedBooking: booking
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Payment API endpoint
app.post('/api/payments', (req, res) => {
  const { booking_id, amount } = req.body;
  
  if (!booking_id || !amount) {
    return res.status(400).json({ error: 'Booking ID and amount are required' });
  }
  
  // In a real app, this would integrate with a payment processor
  // For now, we'll simulate a successful payment
  
  // Update booking status to completed
  db.run(
    'UPDATE bookings SET status = ? WHERE id = ?',
    ['completed', booking_id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Booking not found' });
      
      res.json({ 
        success: true, 
        message: `Payment of $${amount} processed successfully for booking #${booking_id}`,
        booking_id,
        amount
      });
    }
  );
});

// Get a single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Pet Location Tracking Routes
// In-memory storage for pet location data
let petLocationData = {
  pet_id: 1,
  latitude: 33.6844, // Default Islamabad coordinates
  longitude: 73.0479,
  timestamp: new Date().toISOString()
};

// Update pet location (for iPhone/GPS tracker)
app.post('/api/update-pet-location', async (req, res) => {
  console.log('\n🚀 ==========================================');
  console.log('📱 iPhone Location Update Received!');
  console.log('==========================================\n');
  console.log('📥 Request received at:', new Date().toISOString());
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('🌐 Request origin:', req.headers.origin || req.headers.referer || 'Direct API call');
  console.log('👤 User agent:', req.headers['user-agent'] || 'Unknown');
  
  try {
    const { pet_id, latitude, longitude } = req.body;
    
    console.log('\n📊 Extracted data:');
    console.log('   Pet ID:', pet_id, `(type: ${typeof pet_id})`);
    console.log('   Latitude:', latitude, `(type: ${typeof latitude})`);
    console.log('   Longitude:', longitude, `(type: ${typeof longitude})`);
    
    // Validate required fields
    if (!pet_id || !latitude || !longitude) {
      console.error('❌ Validation failed: Missing required fields');
      console.error('   pet_id:', pet_id ? '✅' : '❌ MISSING');
      console.error('   latitude:', latitude !== undefined ? '✅' : '❌ MISSING');
      console.error('   longitude:', longitude !== undefined ? '✅' : '❌ MISSING');
      return res.status(400).json({
        error: 'Missing required fields: pet_id, latitude, longitude'
      });
    }
    
    console.log('✅ Validation passed: All required fields present');

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        error: 'Invalid latitude. Must be between -90 and 90'
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid longitude. Must be between -180 and 180'
      });
    }

    const locationData = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      lastUpdated: new Date().toISOString()
    };

    console.log('\n📍 Processed location data:');
    console.log('   lat:', locationData.lat);
    console.log('   lng:', locationData.lng);
    console.log('   timestamp:', locationData.lastUpdated);

    // ✅ NEW: Write to Firebase Realtime Database (for geofencing)
    // Support both string IDs (Firebase UIDs) and numeric IDs
    const petIdString = String(pet_id); // Convert to string to support all ID formats
    
    console.log('\n🔥 Writing to Firebase Realtime Database...');
    console.log('   Pet ID (string):', petIdString);
    console.log('   Path 1: /pets/' + petIdString + '/location');
    console.log('   Path 2: /gps_tracking/' + petIdString);
    
    try {
      const locationRef = realtimeDb.ref(`pets/${petIdString}/location`);
      await locationRef.set(locationData);
      console.log(`✅ SUCCESS: Location saved to Firebase at /pets/${petIdString}/location`);
      console.log('   Data:', JSON.stringify(locationData, null, 2));
      
      // Also write to gps_tracking path for backward compatibility
      const gpsRef = realtimeDb.ref(`gps_tracking/${petIdString}`);
      await gpsRef.set(locationData);
      console.log(`✅ SUCCESS: Location also saved to /gps_tracking/${petIdString}`);
    } catch (firebaseError) {
      console.error('❌ ERROR: Failed to write to Firebase');
      console.error('   Error details:', firebaseError.message);
      console.error('   Stack:', firebaseError.stack);
      // Continue anyway - still broadcast via Socket.IO
    }

    // Keep in-memory storage for backward compatibility
    petLocationData = {
      pet_id: petIdString, // Keep as string to support Firebase UIDs
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: locationData.lastUpdated
    };

    console.log('\n💾 In-memory storage updated:');
    console.log('   Data:', JSON.stringify(petLocationData, null, 2));

    // Broadcast the location update to all connected clients via Socket.IO
    const connectedClients = io.engine.clientsCount;
    console.log('\n📡 Broadcasting via Socket.IO...');
    console.log('   Connected clients:', connectedClients);
    
    io.emit('petLocationUpdate', {
      petId: petIdString, // Broadcast as string
      latitude: locationData.lat,
      longitude: locationData.lng,
      timestamp: locationData.lastUpdated
    });
    console.log('✅ Broadcast sent successfully to', connectedClients, 'client(s)');

    const responseData = {
      success: true,
      message: 'Location updated successfully',
      data: {
        pet_id: petIdString, // Return as string
        latitude: locationData.lat,
        longitude: locationData.lng,
        timestamp: locationData.lastUpdated,
        savedToFirebase: true
      }
    };

    console.log('\n✅ Response sent to iPhone:');
    console.log('   Status: 200 OK');
    console.log('   Data:', JSON.stringify(responseData, null, 2));
    console.log('\n🎉 ==========================================');
    console.log('✅ iPhone Location Update Complete!');
    console.log('==========================================\n');

    res.json(responseData);

  } catch (error) {
    console.error('\n❌ ==========================================');
    console.error('❌ ERROR: Failed to update pet location');
    console.error('==========================================');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Request body:', JSON.stringify(req.body, null, 2));
    console.error('==========================================\n');
    
    res.status(500).json({ 
      error: 'Failed to update location',
      details: error.message 
    });
  }
});

// Get current pet location (for map display)
app.get('/api/pet-location', (req, res) => {
  res.json({
    latitude: petLocationData.latitude,
    longitude: petLocationData.longitude,
    timestamp: petLocationData.timestamp
  });
});

// Get all providers (users with account_type = 'serviceProvider')
app.get('/api/providers', async (req, res) => {
  try {
  const { lat, lon, radius = 10 } = req.query;
  
    // Get all users who are service providers
    const allUsers = await UserService.getAllUsers();
    let providers = allUsers.filter(user => 
      user.accountType === 'serviceProvider' || user.role === 'provider'
    );
    
    // Filter providers with location data
    let validProviders = providers.filter(provider => 
      provider.location && provider.location.latitude && provider.location.longitude
    );
    
    // Apply location filtering if coordinates are provided
    let filteredProviders = validProviders;
    
    if (lat && lon && radius) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      const radiusKm = parseFloat(radius);
      
      // Filter providers by distance using Haversine formula
      filteredProviders = validProviders.filter(provider => {
        const providerLat = parseFloat(provider.location.latitude);
        const providerLon = parseFloat(provider.location.longitude);
        
        // Haversine formula to calculate distance
        const R = 6371; // Earth's radius in kilometers
        const dLat = (providerLat - userLat) * Math.PI / 180;
        const dLon = (providerLon - userLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(providerLat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance <= radiusKm;
      });
    }
    
    // Get all services to check which providers have services
    const allServices = await ServiceOffering.getAllServices();
    const providerIdsWithServices = [...new Set(allServices.map(s => s.providerId))];
      
      // Only return providers who have services
      const finalProviders = filteredProviders.filter(provider => 
        providerIdsWithServices.includes(provider.id)
      );
      
    // Format for backwards compatibility
    const formattedProviders = finalProviders.map(provider => ({
      id: provider.id,
      provider_id: provider.id,
      name: provider.name,
      email: provider.email,
      account_type: 'serviceProvider',
      phone: provider.phone || '',
      address: provider.address || '',
      bio: provider.bio || '',
      business_hours: provider.businessHours || null,
      latitude: provider.location?.latitude || null,
      longitude: provider.location?.longitude || null
    }));
    
    res.json(formattedProviders);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============== CLINIC API ENDPOINTS ===============
// Note: Clinics are now handled as providers - redirect to providers API

// Redirect /api/clinics to /api/providers for backward compatibility
app.get('/api/clinics', (req, res) => {
  console.log('GET /api/clinics redirecting to providers API');
  // Just redirect internally to the providers endpoint
  req.url = '/api/providers';
  return app._router.handle(req, res);
});

// Redirect clinic by ID to provider by ID
app.get('/api/clinics/:id', (req, res) => {
  const providerId = req.params.id;
  console.log(`GET /api/clinics/${providerId} redirecting to provider API`);
  
  // Get provider data
  db.get('SELECT u.*, pp.* FROM users u LEFT JOIN provider_profiles pp ON u.id = pp.provider_id WHERE u.id = ?', 
    [providerId], (err, provider) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Get provider services
    db.all('SELECT * FROM services WHERE provider_id = ?', [providerId], (err, services) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        clinic_id: provider.id,
        name: provider.name,
        address: provider.address,
        latitude: provider.latitude,
        longitude: provider.longitude,
        contact_number: provider.phone,
        bio: provider.bio,
        services: services
      });
    });
  });
});

// Helper to robustly resolve API key from multiple .env locations
function resolveGeminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try { require('dotenv').config({ path: path.join(__dirname, '.env') }); } catch (_) {}
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try { require('dotenv').config({ path: path.join(process.cwd(), 'server', '.env') }); } catch (_) {}
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try { require('dotenv').config({ path: path.join(process.cwd(), '.env') }); } catch (_) {}
  return process.env.GEMINI_API_KEY;
}

// Get provider profile by provider ID
app.get('/api/provider-profile/:providerId', async (req, res) => {
  try {
  const { providerId } = req.params;
  
    console.log(`📥 Getting provider-profile for: ${providerId}`);
    
    const user = await UserService.getUserById(providerId);
    
    if (!user) {
      console.log(`  ⚠️ Provider not found: ${providerId}`);
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    
    // Return profile data from user document (same format as the other endpoint)
    const profile = {
      provider_id: providerId,
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      business_hours: user.businessHours || {
        monday: { open: "09:00", close: "17:00", isOpen: true },
        tuesday: { open: "09:00", close: "17:00", isOpen: true },
        wednesday: { open: "09:00", close: "17:00", isOpen: true },
        thursday: { open: "09:00", close: "17:00", isOpen: true },
        friday: { open: "09:00", close: "17:00", isOpen: true },
        saturday: { open: "10:00", close: "15:00", isOpen: true },
        sunday: { open: "10:00", close: "15:00", isOpen: false }
      },
      latitude: user.location?.latitude || null,
      longitude: user.location?.longitude || null
    };
    
    console.log(`  ✅ Returning provider-profile for: ${user.name}`);
    res.json(profile);
  } catch (error) {
    console.error('❌ Error fetching provider profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// In-memory chat history storage (per session)
const chatHistories = new Map();

// AI Chatbot Route using Google Gemini
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message, sessionId } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Request body must include a string "message"' });
    }

    // Use sessionId or create a default one
    const currentSessionId = sessionId || 'default-session';
    
    // Get or initialize chat history for this session
    if (!chatHistories.has(currentSessionId)) {
      chatHistories.set(currentSessionId, []);
    }
    const chatHistory = chatHistories.get(currentSessionId);

    const apiKey = resolveGeminiKey();
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set (env not loaded)');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Fetch real data from database to provide context
    const fetchDatabaseContext = () => {
      return new Promise((resolve) => {
        let contextData = {
          providers: [],
          services: [],
          recentBookings: []
        };
        
        // Get service providers with their profiles
        db.all(`
          SELECT u.name, pp.address, pp.business_hours, pp.phone 
          FROM users u 
          LEFT JOIN provider_profiles pp ON u.id = pp.provider_id 
          WHERE u.account_type = 'serviceProvider' 
          LIMIT 5
        `, (err, providers) => {
          if (!err && providers) {
            contextData.providers = providers;
          }
          
          // Get available services
          db.all(`
            SELECT s.name, s.description, s.price, u.name as provider_name, pp.address
            FROM services s 
            JOIN users u ON s.provider_id = u.id 
            LEFT JOIN provider_profiles pp ON u.id = pp.provider_id
            LIMIT 8
          `, (err, services) => {
            if (!err && services) {
              contextData.services = services;
            }
            
            // Get recent booking stats
            db.all(`
              SELECT COUNT(*) as total_bookings, 
                     COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings
              FROM bookings
            `, (err, bookingStats) => {
              if (!err && bookingStats) {
                contextData.bookingStats = bookingStats[0];
              }
              resolve(contextData);
            });
          });
        });
      });
    };

    // Fetch database context
    const dbContext = await fetchDatabaseContext();
    
    // Debug: Log the context data
    console.log('Database context fetched:', JSON.stringify(dbContext, null, 2));
    
    // Build context text from real data
    let contextText = "\n\nCurrent PetCareHub Data:\n";
    
    // Add providers/clinics info
    if (dbContext.providers.length > 0) {
      contextText += "\nAvailable Service Providers:\n";
      dbContext.providers.forEach((provider, index) => {
        const address = provider.address || 'Location not specified';
        let hours = 'Contact for hours';
        
        // Parse business hours if available
        if (provider.business_hours) {
          try {
            const hoursData = JSON.parse(provider.business_hours);
            const openDays = [];
            
            Object.entries(hoursData).forEach(([day, schedule]) => {
              if (schedule.isOpen) {
                openDays.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${schedule.open}-${schedule.close}`);
              }
            });
            
            if (openDays.length > 0) {
              hours = openDays.join(', ');
            }
          } catch (e) {
            hours = 'Business hours available';
          }
        }
        
        contextText += `${index + 1}. ${provider.name} - ${address} (${hours})\n`;
      });
    }
    
    // Add services info
    if (dbContext.services.length > 0) {
      contextText += "\nAvailable Services:\n";
      dbContext.services.forEach((service, index) => {
        const location = service.address || 'Various locations';
        contextText += `${index + 1}. ${service.name} by ${service.provider_name} - $${service.price} (${location})\n`;
      });
    }
    
    // Add booking stats
    if (dbContext.bookingStats) {
      contextText += `\nPlatform Stats: ${dbContext.bookingStats.total_bookings} total bookings, ${dbContext.bookingStats.confirmed_bookings} confirmed\n`;
    }

    console.log('Context text built:', contextText);

    // System instruction for PetCareHub context
    const systemPrompt = `You are PetCareHub AI Assistant. 

${contextText}

CRITICAL INSTRUCTIONS: 
- When users ask about nail cutting prices, you MUST answer: "Nail Cutting by aman sheikh costs ₨2,200"
- When users ask about dental services, you MUST answer: "dental by azfar murtaza costs ₨1,100" 
- When users ask about grooming, you MUST answer: "tail grooming by bezi rufus costs ₨1,000"
- Always reference the EXACT provider names and prices from the data above
- DO NOT give generic answers - use the specific data provided

You help users with:
- Tracking their pets using GPS
- Finding nearby clinics and booking services  
- Answering FAQs about pets and pet care
- Guiding users about our platform features

IMPORTANT SAFETY AND BEHAVIOR RULES:
- Do NOT provide medical diagnoses or specific medical advice
- Always recommend visiting a veterinarian for serious health issues or concerns
- Keep answers friendly, short, and directly related to PetCareHub services
- Never answer questions unrelated to pets, clinics, or services - redirect politely back to PetCareHub topics
- If asked about non-pet topics, respond: "I'm here to help with pet care and PetCareHub services. How can I assist you with your pet's needs today?"

Always use the real data provided in your context when answering questions about our platform.`;

    // Add current user message to history
    chatHistory.push({ role: 'user', content: message });

    // Keep only last 5 messages (10 total including responses)
    if (chatHistory.length > 10) {
      chatHistory.splice(0, chatHistory.length - 10);
    }

    // Build conversation history for Gemini
    let conversationHistory = systemPrompt + "\n\nConversation History:\n";
    chatHistory.forEach((msg, index) => {
      if (index < chatHistory.length - 1) { // Don't include the current message yet
        conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      }
    });
    conversationHistory += `\nUser: ${message}`;

    let reply = '';
    try {
      // Use new Google GenAI SDK
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({});
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversationHistory,
      });
      reply = response.text || '';
    } catch (sdkErr) {
      console.warn('SDK call failed, falling back to REST:', sdkErr?.message || sdkErr);
      // Fallback to REST API (avoids ESM/runtime issues)
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const restRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: conversationHistory }] }]
        })
      });
      if (!restRes.ok) {
        const errText = await restRes.text().catch(() => '');
        throw new Error(errText || `HTTP ${restRes.status}`);
      }
      const restJson = await restRes.json();
      reply = restJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // Add assistant response to history
    chatHistory.push({ role: 'assistant', content: reply });

    // Keep only last 5 user-assistant pairs (10 messages total)
    if (chatHistory.length > 10) {
      chatHistory.splice(0, chatHistory.length - 10);
    }

    // Update the stored history
    chatHistories.set(currentSessionId, chatHistory);

    console.log(`Chat history for session ${currentSessionId}:`, chatHistory.length, 'messages');

    return res.json({ reply: reply || "", sessionId: currentSessionId });
  } catch (err) {
    console.error('Error in /api/chatbot:', err?.message || err);
    // Return graceful fallback so UI keeps working
    return res.json({ 
      reply: "I'm having trouble reaching the AI right now. Please try again shortly.",
      error: err?.message || 'Failed to get response from AI'
    });
  }
});

// =============== DISEASE PREDICTION API ===============

// Create disease predictions table
db.run(`CREATE TABLE IF NOT EXISTS disease_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  symptoms TEXT NOT NULL,
  predictions TEXT NOT NULL,
  animal_type TEXT,
  age INTEGER,
  weight REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)`, (err) => {
  if (err) {
    console.error('Error creating disease_predictions table:', err.message);
  } else {
    console.log('Disease predictions table ensured');
  }
});

// Disease prediction endpoint
app.post('/api/predict-disease', async (req, res) => {
  const { symptoms, animal_type, age, weight, gender, breed } = req.body;
  
  // Get user ID from session/auth (you may need to adjust this based on your auth system)
  const userId = req.body.user_id || req.user?.id || 1; // Fallback to user ID 1 for testing
  
  // Validate input
  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    return res.status(400).json({
      error: 'Symptoms array is required and must not be empty',
      predictions: []
    });
  }

  console.log('Disease prediction request:', {
    symptoms,
    animal_type,
    userId,
    timestamp: new Date().toISOString()
  });

  const inputData = {
    symptoms,
    animal_type: animal_type || 'Dog',
    age: age || 3,
    weight: weight || 20.0,
    gender: gender || 'Male',
    breed: breed || 'Mixed'
  };

  try {
    // Call Flask ML API (local or deployed)
    const mlApiUrl = process.env.ML_API_URL || 'http://localhost:5002';
    
    console.log(`Calling ML API at ${mlApiUrl}/predict`);
    
    // Retry logic for when service is waking up from sleep
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} to call ML API...`);
        
        response = await axios.post(`${mlApiUrl}/predict`, inputData, {
          timeout: 45000, // 45 second timeout (increased for cold starts)
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Success! Break out of retry loop
        console.log('✅ ML API responded successfully');
        break;
        
      } catch (err) {
        lastError = err;
        console.log(`⚠️ Attempt ${attempt} failed: ${err.message}`);
        
        // If this isn't the last attempt and it's a timeout/connection error, retry
        if (attempt < maxRetries && (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED')) {
          console.log(`⏳ Service might be waking up... retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
          continue;
        }
        
        // Last attempt or non-retryable error
        throw err;
      }
    }

    const predictionResult = response.data;
    
    if (predictionResult.error) {
      console.error('Prediction error:', predictionResult.error);
      return res.status(500).json(predictionResult);
    }

    // Save prediction to Firestore
    try {
      const predictionData = {
        userId: userId.toString(),
        symptoms,
        predictions: predictionResult.predictions,
        animalType: animal_type,
        age,
        weight,
        timestamp: new Date().toISOString()
      };
      
      await firestoreDb.collection('disease_predictions').add(predictionData);
      console.log('Disease prediction saved to Firestore');
    } catch (dbError) {
      console.error('Error saving prediction to Firestore:', dbError.message);
      // Continue even if DB save fails
    }

    // Return successful prediction
    res.json({
      ...predictionResult,
      saved: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling ML API:', error.message);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(503).json({
        error: 'ML prediction service unavailable',
        details: 'The disease prediction service is waking up. Please try again in 10 seconds.',
        predictions: [],
        retryable: true
      });
    }
    
    res.status(500).json({
      error: 'Disease prediction failed',
      details: error.message,
      predictions: []
    });
  }
});

// Get user's disease prediction history
app.get('/api/disease-predictions/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.all(`SELECT id, date, symptoms, predictions, animal_type, age, weight, created_at 
          FROM disease_predictions 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT 50`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching disease predictions:', err.message);
        return res.status(500).json({ error: 'Failed to fetch prediction history' });
      }
      
      // Parse JSON strings back to objects
      const predictions = rows.map(row => ({
        ...row,
        symptoms: JSON.parse(row.symptoms),
        predictions: JSON.parse(row.predictions)
      }));
      
      res.json(predictions);
    }
  );
});

// Get disease prediction statistics
app.get('/api/disease-stats/:userId', (req, res) => {
  const userId = req.params.userId;
  
  db.all(`SELECT 
            COUNT(*) as total_predictions,
            COUNT(DISTINCT DATE(created_at)) as prediction_days,
            animal_type,
            COUNT(*) as count
          FROM disease_predictions 
          WHERE user_id = ?
          GROUP BY animal_type`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Error fetching disease stats:', err.message);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }
      
      // Calculate total predictions
      const totalPredictions = rows.reduce((sum, row) => sum + row.count, 0);
      
      res.json({
        total_predictions: totalPredictions,
        by_animal_type: rows,
        last_updated: new Date().toISOString()
      });
    }
  );
});

// API-only backend - frontend hosted separately on Firebase
// Health check endpoint for root path
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    message: 'PetCareHub Backend API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      pets: '/api/pets',
      services: '/api/services',
      bookings: '/api/bookings',
      providers: '/api/providers',
      petLocation: '/api/pet-location',
      chatbot: '/api/chatbot',
      payments: '/api/create-checkout-session'
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO enabled for real-time pet tracking`);
  
  // Start ML Keep-Alive service if ML_API_URL is configured
  if (process.env.ML_API_URL) {
    console.log(`\n🧠 Starting ML Keep-Alive service for: ${process.env.ML_API_URL}`);
    const { startKeepAlive } = require('./keep-ml-alive');
    startKeepAlive();
  } else {
    console.log('⚠️  ML_API_URL not configured - ML Keep-Alive service disabled');
  }
}); 