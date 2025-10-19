/**
 * Vercel Serverless Backend
 * This wraps the main backend server for Vercel deployment
 */

const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Use service account from environment variable
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://fyppp-5b4f0-default-rtdb.firebaseio.com'
    });
    
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
}

const db = admin.firestore();
const realtimeDb = admin.database();

// Import services (we'll need to recreate these for Vercel)
const {
  UserService,
  PetService,
  ServiceOffering,
  BookingService,
  PaymentService
} = require('./services/firestoreService');

const app = express();

// CORS configuration - allow all origins for deployed app
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://fyppp-5b4f0.web.app',
    'https://fyppp-5b4f0.firebaseapp.com'
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// USER ROUTES
// ============================================

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SERVICE ROUTES
// ============================================

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const providerId = req.query.provider_id;
    const providerName = req.query.provider_name;
    
    let services;
    
    if (!providerId && !providerName) {
      services = await ServiceOffering.getAllServices();
    } else if (providerName) {
      const allServices = await ServiceOffering.getAllServices();
      services = allServices.filter(service => 
        service.provider_name && service.provider_name.toLowerCase().includes(providerName.toLowerCase())
      );
    } else {
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

// Get service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await ServiceOffering.getServiceById(req.params.id);
    
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

// Create service
app.post('/api/services', async (req, res) => {
  try {
    const { provider_id, name, description, price, category, duration } = req.body;
  
    if (!provider_id || !name || !price) {
      return res.status(400).json({ error: 'Provider ID, name and price are required' });
    }
  
    const user = await UserService.getUserById(provider_id);
    
    if (!user || (user.accountType !== 'serviceProvider' && user.role !== 'provider')) {
      return res.status(400).json({ 
        error: 'Invalid provider ID. Services can only be created by service providers.' 
      });
    }
    
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

// Delete service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    
    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }
    
    await ServiceOffering.deleteService(serviceId);
    
    res.json({
      success: true,
      message: `Service with ID ${serviceId} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PET ROUTES
// ============================================

// Get pets by owner
app.get('/api/pets/owner/:ownerId', async (req, res) => {
  try {
    const pets = await PetService.getPetsByOwner(req.params.ownerId);
    res.json(pets);
  } catch (error) {
    console.error('Error getting pets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create pet
app.post('/api/pets', async (req, res) => {
  try {
    const petData = req.body;
    const petId = await PetService.createPet(petData);
    res.status(201).json({ id: petId, ...petData });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete pet
app.delete('/api/pets/:id', async (req, res) => {
  try {
    await PetService.deletePet(req.params.id);
    res.json({ success: true, message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// BOOKING ROUTES
// ============================================

// Get bookings by pet owner
app.get('/api/bookings/pet-owner/:ownerId', async (req, res) => {
  try {
    const bookings = await BookingService.getBookingsByPetOwner(req.params.ownerId);
    res.json(bookings);
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookings by provider
app.get('/api/bookings/provider/:providerId', async (req, res) => {
  try {
    const bookings = await BookingService.getBookingsByProvider(req.params.providerId);
    res.json(bookings);
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    const bookingId = await BookingService.createBooking(bookingData);
    res.status(201).json({ id: bookingId, ...bookingData });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update booking
app.put('/api/bookings/:id', async (req, res) => {
  try {
    await BookingService.updateBooking(req.params.id, req.body);
    res.json({ success: true, message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROVIDERS ROUTES
// ============================================

// Get all providers
app.get('/api/providers', async (req, res) => {
  try {
    const allUsers = await UserService.getAllUsers();
    const providers = allUsers.filter(user => 
      user.accountType === 'serviceProvider' || user.role === 'provider'
    );
    res.json(providers);
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get provider profile
app.get('/api/providers/:id/profile', async (req, res) => {
  try {
    const provider = await UserService.getUserById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.json(provider);
  } catch (error) {
    console.error('Error getting provider:', error);
    res.status(500).json({ error: error.message });
  }
});

// Export for Vercel
module.exports = app;

