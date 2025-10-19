# Migration Command Reference

Quick command reference for the SQLite to Firestore migration.

## 📋 Prerequisites

```bash
# Install dependencies (root)
npm install firebase-admin

# Install dependencies (server)
cd server && npm install firebase-admin && cd ..

# Download service account key from Firebase Console
# Save as: firebase-service-account.json
```

---

## 🔥 Firebase Commands

### Initial Setup

```bash
# Login to Firebase
firebase login

# List your projects
firebase projects:list

# Switch to your project
firebase use your-project-id

# Check current project
firebase use
```

### Deploy Commands

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only database:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes

# Deploy multiple
firebase deploy --only firestore:rules,database:rules,storage:rules
```

### Emulator Commands

```bash
# Start all emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,functions

# Start emulators with data export
firebase emulators:start --export-on-exit=./emulator-data

# Import emulator data
firebase emulators:start --import=./emulator-data
```

### Function Commands

```bash
# View function logs
firebase functions:log

# View logs for specific function
firebase functions:log --only createUserProfile

# Delete a function
firebase functions:delete functionName
```

---

## 🔄 Migration Commands

### Dry Run (Preview)

```bash
# Preview what will be migrated
node migrate-sqlite-to-firestore.js --dry-run

# Preview + see backup
node migrate-sqlite-to-firestore.js --dry-run --backup
```

### Backup Commands

```bash
# Create JSON backup of SQLite data
node migrate-sqlite-to-firestore.js --backup

# Copy SQLite database
cp database.sqlite database.sqlite.backup

# Restore SQLite database
cp database.sqlite.backup database.sqlite
```

### Run Migration

```bash
# Full migration
node migrate-sqlite-to-firestore.js

# Migrate specific collections
node migrate-sqlite-to-firestore.js --collections=users
node migrate-sqlite-to-firestore.js --collections=users,pets
node migrate-sqlite-to-firestore.js --collections=users,pets,services

# All options combined
node migrate-sqlite-to-firestore.js --dry-run --backup --collections=users
```

---

## 🧪 Testing Commands

### Check Data Counts

```bash
# SQLite user count
sqlite3 database.sqlite "SELECT COUNT(*) FROM users;"

# SQLite pet count
sqlite3 database.sqlite "SELECT COUNT(*) FROM pets;"

# SQLite service count
sqlite3 database.sqlite "SELECT COUNT(*) FROM services;"

# SQLite booking count
sqlite3 database.sqlite "SELECT COUNT(*) FROM bookings;"

# View SQLite tables
sqlite3 database.sqlite ".tables"

# View SQLite schema
sqlite3 database.sqlite ".schema users"
```

### Test API Endpoints

```bash
# Test users endpoint
curl http://localhost:5001/api/users

# Test user by ID
curl http://localhost:5001/api/users/user_1

# Test pets by owner
curl http://localhost:5001/api/pets?owner_id=user_1

# Test services
curl http://localhost:5001/api/services

# Test services by provider
curl http://localhost:5001/api/services?provider_id=user_2

# Test bookings by user
curl http://localhost:5001/api/bookings/pet-owner/user_1

# Test bookings by provider
curl http://localhost:5001/api/bookings/provider/user_2

# POST test (create pet)
curl -X POST http://localhost:5001/api/pets \
  -H "Content-Type: application/json" \
  -d '{"owner_id":"user_1","name":"Max","type":"Dog"}'
```

---

## 🏗️ Build Commands

### Frontend

```bash
# Start development server
npm start

# Build for production
npm run build

# Test production build locally
npm install -g serve
serve -s build
```

### Backend

```bash
# Start backend server
npm run start:backend

# Start both frontend and backend
npm run dev
```

### Firebase Hosting

```bash
# Deploy to Firebase Hosting
npm run build
firebase deploy --only hosting

# Preview before deploy
firebase hosting:channel:deploy preview
```

---

## 🧹 Cleanup Commands

### Remove SQLite

```bash
# Uninstall SQLite packages
npm uninstall sqlite3 better-sqlite3

# Remove database files
mkdir old-database
mv database.sqlite old-database/
mv database.sqlite.backup old-database/

# Or delete completely (CAREFUL!)
rm database.sqlite
```

### Clean Node Modules

```bash
# Remove and reinstall dependencies
rm -rf node_modules
npm install

# Clean npm cache
npm cache clean --force
```

### Clean Build Files

```bash
# Remove build folder
rm -rf build

# Remove Firebase cache
rm -rf .firebase

# Clean everything and rebuild
rm -rf node_modules build .firebase
npm install
npm run build
```

---

## 📊 Monitoring Commands

### Firebase Console

```bash
# Open Firebase Console in browser
firebase open

# Open specific pages
firebase open hosting
firebase open database
firebase open functions
```

### Check Firestore Data

```bash
# Using Node.js (create check-firestore.js)
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
  const users = await db.collection('users').get();
  const pets = await db.collection('pets').get();
  const services = await db.collection('services').get();
  
  console.log('Firestore Counts:');
  console.log('Users:', users.size);
  console.log('Pets:', pets.size);
  console.log('Services:', services.size);
}

check();
"
```

### View Logs

```bash
# Server logs
tail -f server.log

# Firebase function logs
firebase functions:log --limit 50

# Follow function logs in real-time
firebase functions:log --limit 10 --follow
```

---

## 🔧 Development Commands

### Environment Setup

```bash
# Copy environment template
cp env.template .env

# Edit environment variables
nano .env
# or
code .env
```

### Git Commands

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/firestore-migration

# Stage changes
git add .

# Commit
git commit -m "Migrate from SQLite to Firestore"

# Push to remote
git push origin feature/firestore-migration
```

### Database Inspection

```bash
# View database schema
node view-database.js

# Interactive SQLite shell
sqlite3 database.sqlite

# SQLite commands in shell:
# .tables           - List tables
# .schema tablename - Show table structure
# SELECT * FROM users; - Query data
# .quit             - Exit
```

---

## 🚀 Deployment Commands

### Complete Deployment

```bash
# 1. Build frontend
npm run build

# 2. Test locally
npm run start:backend &
serve -s build

# 3. Deploy to Firebase
firebase deploy

# 4. View deployed site
firebase open hosting:site
```

### Staged Deployment

```bash
# Deploy to staging channel
firebase hosting:channel:deploy staging

# Test staging
# Visit: https://your-project--staging-xxxxx.web.app

# Deploy to production
firebase deploy --only hosting
```

---

## 📋 Quick Migration Workflow

### Complete Migration (Copy & Paste)

```bash
# 1. Backup
cp database.sqlite database.sqlite.backup

# 2. Dry run
node migrate-sqlite-to-firestore.js --dry-run

# 3. Create backup JSON
node migrate-sqlite-to-firestore.js --backup

# 4. Run migration
node migrate-sqlite-to-firestore.js

# 5. Verify
echo "Check Firebase Console: https://console.firebase.google.com/"

# 6. Test backend
npm run start:backend &
sleep 5
curl http://localhost:5001/api/users

# 7. Test frontend
npm start
```

---

## 🆘 Emergency Rollback

```bash
# Stop servers
killall node

# Restore SQLite
cp database.sqlite.backup database.sqlite

# Revert code
git checkout server/index.js

# Restart
npm run start:backend
```

---

## 📁 File Operations

### View Files

```bash
# List all Firebase config files
ls -la | grep firebase

# View file contents
cat firebase.json
cat firestore.rules
cat database.rules.json

# Search in files
grep -r "collection('users')" server/
```

### Edit Files

```bash
# Edit with nano
nano server/index.js

# Edit with VS Code
code server/index.js

# Edit multiple files
code server/index.js server/services/firestoreService.js
```

---

## 🔍 Debugging Commands

### Check Ports

```bash
# Check if port is in use
lsof -i :5001
lsof -i :3000

# Kill process on port
lsof -ti:5001 | xargs kill -9
```

### Check Environment

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Firebase CLI version
firebase --version

# Check installed packages
npm list --depth=0
```

### View Errors

```bash
# Watch server logs
tail -f server.log

# Watch with filtering
tail -f server.log | grep -i error

# Check npm debug log
cat npm-debug.log
```

---

## 💡 Useful Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Firebase shortcuts
alias fb='firebase'
alias fbdeploy='firebase deploy'
alias fbemu='firebase emulators:start'
alias fblogs='firebase functions:log'

# Migration shortcuts
alias migrate-dry='node migrate-sqlite-to-firestore.js --dry-run'
alias migrate='node migrate-sqlite-to-firestore.js'
alias migrate-backup='node migrate-sqlite-to-firestore.js --backup'

# Server shortcuts
alias backend='npm run start:backend'
alias frontend='npm start'
alias dev='npm run dev'

# Quick checks
alias check-users='curl http://localhost:5001/api/users'
alias check-pets='curl http://localhost:5001/api/pets?owner_id=user_1'
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

---

## 📚 Documentation Commands

### View Documentation

```bash
# View in terminal
cat MIGRATION_QUICK_START.md
less MIGRATION_GUIDE.md

# Open in browser (if using mdless or similar)
mdless MIGRATION_QUICK_START.md

# Open in VS Code
code MIGRATION_QUICK_START.md
code SERVER_MIGRATION_EXAMPLES.md
```

---

**Save this file for quick reference during migration!** 📋

