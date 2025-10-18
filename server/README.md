# PetCareHub Backend Server

Express.js + Socket.IO backend for PetCareHub - Real-time pet tracking and service booking platform.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create .env file from example
cp env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Or start production mode
npm start
```

Server will run on `http://localhost:5001`

## 📦 Tech Stack

- **Express.js** - REST API framework
- **Socket.IO** - Real-time WebSocket communication
- **Firebase Admin SDK** - Database (Firestore) and Authentication
- **Stripe** - Payment processing
- **Google Gemini AI** - AI chatbot integration

## 🗂️ Project Structure

```
server/
├── config/
│   └── firebaseAdmin.js     # Firebase Admin initialization
├── services/
│   └── firestoreService.js  # Database service layer
├── index.js                 # Main server file
├── stripe.js               # Stripe payment routes
├── package.json            # Dependencies
├── env.example            # Environment variables template
└── render.yaml            # Render deployment config
```

## 🔧 Configuration

### Environment Variables

Required environment variables (see `env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Service account private key | Yes |
| `FIREBASE_DATABASE_URL` | Realtime Database URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `FRONTEND_URL` | Frontend domain for CORS | Yes |

### Firebase Setup

**Option 1: Service Account File (Development)**
1. Download service account JSON from Firebase Console
2. Save as `firebase-service-account.json` in project root
3. Server will auto-detect and use it

**Option 2: Environment Variables (Production/Render)**
1. Set the four Firebase env vars (see above)
2. Server will use environment credentials

## 📡 API Endpoints

### Users & Authentication
- `POST /api/users` - Register new user
- `POST /api/login` - User login
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Pets
- `GET /api/pets?owner_id={id}` - Get owner's pets
- `POST /api/pets` - Add new pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (providers only)
- `DELETE /api/services/:id` - Delete service

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/pet-owner/:id` - Get owner bookings
- `GET /api/bookings/provider/:id` - Get provider bookings
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Providers
- `GET /api/providers` - Get all service providers
- `GET /api/providers/:id/profile` - Get provider profile
- `PUT /api/providers/:id/profile` - Update provider profile

### Real-time Tracking
- `POST /api/update-pet-location` - Update pet GPS location
- `GET /api/pet-location` - Get current pet location
- **Socket.IO Event:** `petLocationUpdate` - Real-time location updates

### AI Chatbot
- `POST /api/chatbot` - Send message to AI assistant
  ```json
  {
    "message": "What services do you offer?",
    "sessionId": "user-session-id"
  }
  ```

### Payments
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/webhook` - Stripe webhook handler

## 🌐 Socket.IO Events

### Client → Server
```javascript
// No custom events currently, Socket.IO auto-connects
```

### Server → Client
```javascript
socket.on('petLocationUpdate', (data) => {
  // data: { latitude, longitude, timestamp }
});
```

## 🚀 Deployment

### Deploy to Render

See the comprehensive guides:
- **Quick Start:** [../RENDER_QUICK_START.md](../RENDER_QUICK_START.md)
- **Full Guide:** [../RENDER_DEPLOYMENT_GUIDE.md](../RENDER_DEPLOYMENT_GUIDE.md)

**Quick Steps:**
1. Push code to GitHub
2. Create Web Service on Render
3. Set root directory to `server`
4. Add environment variables
5. Deploy!

### Deployment Configuration

File `render.yaml` is included for easy Render setup.

## 🔒 Security Notes

- ⚠️ Never commit `.env` or `firebase-service-account.json`
- ⚠️ Use environment variables in production
- ⚠️ Rotate API keys periodically
- ⚠️ Keep Firebase private key secure
- ⚠️ Validate all user inputs

## 🧪 Testing

### Test Backend APIs

```bash
# Test users endpoint
curl http://localhost:5001/api/users

# Test pet location
curl http://localhost:5001/api/pet-location

# Test chatbot
curl -X POST http://localhost:5001/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

### Test Socket.IO Connection

```javascript
// In browser console or Node.js
const io = require('socket.io-client');
const socket = io('http://localhost:5001');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('petLocationUpdate', (data) => {
  console.log('Location:', data);
});
```

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify credentials are correct
- Check Firebase project ID matches
- Ensure Realtime Database is enabled in Firebase Console

### Socket.IO Not Working
- Check CORS configuration in `index.js`
- Verify frontend URL is in `allowedOrigins`
- Ensure port 5001 is not blocked by firewall

### Stripe Webhook Failing
- Verify webhook secret matches Stripe dashboard
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5001/api/webhook`

### AI Chatbot Errors
- Verify `GEMINI_API_KEY` is set
- Check API quota in Google AI Studio
- Review chatbot logs in console

## 📚 Dependencies

### Production
- `express` - Web framework
- `socket.io` - WebSocket library
- `cors` - CORS middleware
- `firebase-admin` - Firebase SDK
- `stripe` - Payment processing
- `@google/genai` - Gemini AI SDK
- `dotenv` - Environment variables

### Development
- `nodemon` - Auto-restart on file changes

## 🔄 Development Workflow

1. **Make changes** to code
2. **Test locally** with `npm run dev`
3. **Commit changes** to Git
4. **Push to GitHub**
5. **Render auto-deploys** (if enabled)

## 📝 Environment Requirements

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **Python:** >= 3.8 (for ML disease prediction)

## 🆘 Support

For issues or questions:
1. Check the logs: `console` output or Render dashboard
2. Review environment variables
3. Test endpoints with curl or Postman
4. Check Firebase Console for database issues

## 📄 License

ISC

---

**Built with ❤️ for PetCareHub**

