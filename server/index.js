const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const pathOriginal = require('path');

// Firestore setup (replacing SQLite)
const { db: firestoreDb, realtimeDb } = require('./config/firebaseAdmin');
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
      duration: duration || 60
    };
    
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
    
    let services;
  
  if (!providerId && !providerName) {
      // Return all services
      services = await ServiceOffering.getAllServices();
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
    const { pet_owner_id, service_id, pet_id, booking_date, provider_id } = req.body;
    
    console.log('Creating new booking with data:', req.body);
    
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
    
    // Create booking in Firestore
    const bookingData = {
      userId: pet_owner_id,
      serviceId: service_id,
      petId: pet_id,
      providerId: finalProviderId,
      bookingDate: booking_date,
      scheduledDate: booking_date,
      status: 'pending',
      paymentStatus: 'pending',
      stripeSessionId: null
    };
    
    const newBooking = await BookingService.createBooking(bookingData);
    console.log(`✅ Created booking with ID ${newBooking.id}`);
    
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
      booking_date: booking_date,
      status: 'pending',
      payment_status: 'pending',
      service_name: service.name,
      price: service.price,
      provider_id: finalProviderId,
      provider_name: provider?.name || 'Unknown Provider',
      pet_name: pet?.name || 'Unknown Pet',
      pet_type: pet?.species || null,
      pet_breed: pet?.breed || null,
      owner_name: owner?.name || 'Unknown Owner',
      message: 'Booking created successfully!'
    };
    
    console.log(`✅ New booking created: ${bookingDetails.owner_name} booked ${bookingDetails.service_name} with provider ${bookingDetails.provider_name}`);
    
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
        booking_date: booking.bookingDate || booking.scheduledDate,
        status: booking.status,
        payment_status: booking.paymentStatus,
        stripe_session_id: booking.stripeSessionId,
        service_name: service?.name || null,
        price: service?.price || null,
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
    
    // Filter bookings that belong to this provider's services
    const providerBookings = allBookings.filter(booking => 
      providerServiceIds.includes(booking.serviceId)
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
          booking_date: booking.bookingDate || booking.scheduledDate,
          status: booking.status,
          payment_status: booking.paymentStatus,
          stripe_session_id: booking.stripeSessionId,
          service_name: service?.name || null,
          price: service?.price || null,
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
app.put('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  
  console.log(`Updating booking ${bookingId} status to ${status}`);
  
  if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required (pending, confirmed, cancelled, completed)' });
  }
  
  // Check if this is an in-memory booking
  if (global.mockBookings) {
    const bookingIndex = global.mockBookings.findIndex(b => b.id == bookingId);
    if (bookingIndex !== -1) {
      // Update the status of the in-memory booking
      global.mockBookings[bookingIndex].status = status;
      return res.json({ 
        id: bookingId, 
        status,
        message: `Booking status updated to ${status}`
      });
    }
  }
  
  db.run(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, bookingId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Booking not found' });
      res.json({ id: bookingId, status });
    }
  );
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = req.params.id;
  
  console.log(`Deleting booking with ID: ${bookingId}`);
  
  // First check if the booking exists in database
  db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
    if (err) {
      console.error('Error checking booking existence:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    if (booking) {
      // Delete from database
      db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function(err) {
        if (err) {
          console.error('Error deleting booking from database:', err.message);
          return res.status(500).json({ error: err.message });
        }
        
        console.log(`Booking deleted from database: ID ${bookingId}`);
        
        // Also remove from memory if it exists
        if (global.mockBookings) {
          const bookingIndex = global.mockBookings.findIndex(b => b.id == bookingId);
          if (bookingIndex !== -1) {
            global.mockBookings.splice(bookingIndex, 1);
            console.log(`Booking also removed from memory`);
          }
        }
        
        return res.json({
          success: true,
          message: `Booking with ID ${bookingId} deleted successfully`,
          deletedBooking: booking
        });
      });
    } else {
      // Check if we have this booking in memory only
      if (global.mockBookings) {
        const bookingIndex = global.mockBookings.findIndex(b => b.id == bookingId);
        if (bookingIndex !== -1) {
          const memoryBooking = global.mockBookings[bookingIndex];
          global.mockBookings.splice(bookingIndex, 1);
          
          console.log(`Booking deleted from memory: ID ${bookingId}`);
          
          return res.json({
            success: true,
            message: `Booking with ID ${bookingId} deleted successfully`,
            deletedBooking: memoryBooking
          });
        }
      }
      
      // Booking not found anywhere
      console.log(`Booking with ID ${bookingId} not found`);
      return res.status(404).json({ error: 'Booking not found' });
    }
  });
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
app.post('/api/update-pet-location', (req, res) => {
  try {
    const { pet_id, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!pet_id || !latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required fields: pet_id, latitude, longitude'
      });
    }

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

    // Update the stored location data
    petLocationData = {
      pet_id: parseInt(pet_id),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date().toISOString()
    };

    console.log('Pet location updated:', petLocationData);

    // Broadcast the location update to all connected clients
    console.log('📡 Broadcasting location update to', io.engine.clientsCount, 'connected clients');
    io.emit('petLocationUpdate', {
      latitude: petLocationData.latitude,
      longitude: petLocationData.longitude,
      timestamp: petLocationData.timestamp
    });
    console.log('✅ Broadcast sent successfully');

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: petLocationData
    });

  } catch (error) {
    console.error('Error updating pet location:', error);
    res.status(400).json({ error: 'Invalid JSON data' });
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
app.post('/api/predict-disease', (req, res) => {
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

  // Import required modules for child process
  const { spawn } = require('child_process');

  const inputData = {
    symptoms,
    animal_type: animal_type || 'Dog',
    age: age || 3,
    weight: weight || 20.0,
    gender: gender || 'Male',
    breed: breed || 'Mixed'
  };

  try {
    // Spawn Python process
    const pythonProcess = spawn('python3', ['api_predict.py'], {
      cwd: `${__dirname}/../ml_models`,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let outputData = '';
    let errorData = '';

    // Send input data to Python script
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    // Collect output
    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', errorData);
        return res.status(500).json({
          error: 'Disease prediction failed',
          details: errorData,
          predictions: []
        });
      }

      try {
        // Parse Python output
        const predictionResult = JSON.parse(outputData.trim());
        
        if (predictionResult.error) {
          console.error('Prediction error:', predictionResult.error);
          return res.status(500).json(predictionResult);
        }

        // Save prediction to database
        const symptomsJson = JSON.stringify(symptoms);
        const predictionsJson = JSON.stringify(predictionResult.predictions);
        
        db.run(`INSERT INTO disease_predictions 
                (user_id, symptoms, predictions, animal_type, age, weight) 
                VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, symptomsJson, predictionsJson, animal_type, age, weight],
          function(err) {
            if (err) {
              console.error('Error saving prediction to database:', err.message);
              // Still return the prediction even if DB save fails
            } else {
              console.log('Disease prediction saved with ID:', this.lastID);
            }
          }
        );

        // Return successful prediction
        res.json({
          ...predictionResult,
          saved: true,
          timestamp: new Date().toISOString()
        });

      } catch (parseError) {
        console.error('Error parsing Python output:', parseError);
        console.error('Raw output:', outputData);
        res.status(500).json({
          error: 'Failed to parse prediction results',
          details: parseError.message,
          predictions: []
        });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      res.status(500).json({
        error: 'Failed to start disease prediction service',
        details: error.message,
        predictions: []
      });
    });

  } catch (error) {
    console.error('Error in disease prediction:', error);
    res.status(500).json({
      error: 'Internal server error',
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

// Serve React static files
app.use(express.static(path.join(__dirname, '../build')));

// Fallback to React for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO enabled for real-time pet tracking`);
}); 