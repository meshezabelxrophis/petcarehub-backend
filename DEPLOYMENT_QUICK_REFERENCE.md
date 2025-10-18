# 🚀 Firebase Hosting - Quick Reference

## 🌐 Your Live URLs

**Production Site**: https://fyppp-5b4f0.web.app  
**Alternative URL**: https://fyppp-5b4f0.firebaseapp.com  
**Firebase Console**: https://console.firebase.google.com/project/fyppp-5b4f0

---

## ⚡ Quick Commands

### Deploy to Production
```bash
npm run build && firebase deploy --only hosting
```

### Or Use the Deployment Script
```bash
./deploy.sh                    # Build and deploy
./deploy.sh --skip-build       # Deploy without building
./deploy.sh --preview          # Deploy to preview channel
./deploy.sh --functions        # Deploy hosting + functions
```

### NPM Scripts Available
```bash
npm run build                  # Build for production
npm run firebase:hosting       # Deploy hosting only
npm run firebase:deploy        # Deploy everything
npm run firebase:functions     # Deploy functions only
npm run firebase:emulators     # Start local emulators
```

---

## 📁 Project Structure

```
/
├── build/                 # Production build (deployed)
├── src/                   # Source code
├── public/                # Static assets
├── firebase.json          # Firebase config
├── .firebaserc           # Project settings
├── .env                  # Environment variables (DO NOT COMMIT)
├── .env.example          # Example env file
├── deploy.sh             # Deployment script
└── FIREBASE_HOSTING_GUIDE.md  # Full documentation
```

---

## 🔐 Environment Variables

Located in `.env` (already configured):
- ✅ Firebase API Key
- ✅ Auth Domain
- ✅ Project ID
- ✅ Storage Bucket
- ✅ Messaging Sender ID
- ✅ App ID
- ✅ Database URL

**Note**: Never commit `.env` to Git. Use `.env.example` for team reference.

---

## 🛠️ Troubleshooting

### Site Not Updating?
```bash
# Clear build and rebuild
rm -rf build
npm run build
firebase deploy --only hosting
```

### Need to Rollback?
```bash
firebase hosting:rollback
```

### Check Deployment History
```bash
firebase hosting:sites:list
```

---

## 🌍 Custom Domain Setup

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS setup instructions
4. Wait 24-48 hours for SSL certificate

More details: See `FIREBASE_HOSTING_GUIDE.md`

---

## 📊 Key Features Enabled

✅ **Single-Page App Routing** - All routes work with direct URLs  
✅ **HTTPS** - Automatic SSL certificate  
✅ **CDN** - Global content delivery  
✅ **Caching** - Optimized static asset caching  
✅ **Environment Variables** - Firebase config linked  

---

## 🎯 Next Steps

### Optional Enhancements
- [ ] Set up custom domain
- [ ] Enable Firebase Performance Monitoring
- [ ] Set up CI/CD with GitHub Actions
- [ ] Configure Firebase Analytics
- [ ] Add custom security headers

### Monitoring
- Check usage: https://console.firebase.google.com/project/fyppp-5b4f0/usage
- View analytics: https://console.firebase.google.com/project/fyppp-5b4f0/analytics

---

## 📚 Documentation

For detailed information, see:
- **Full Guide**: `FIREBASE_HOSTING_GUIDE.md`
- **Firebase Docs**: https://firebase.google.com/docs/hosting
- **React Build Docs**: https://create-react-app.dev/docs/deployment

---

**Status**: ✅ **DEPLOYED & LIVE**  
**Last Updated**: October 18, 2025

