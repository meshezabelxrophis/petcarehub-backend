# Chatbot Enhancement - Deployment Instructions

## Overview
This guide covers deploying the chatbot enhancements for provider timings and animal type clarification.

---

## 📦 What Needs to Be Deployed

### Files Changed
1. **Frontend**: `src/components/Chatbot.jsx`
2. **Backend**: `api/generate-ai-response.js`

### Where to Deploy
- **Frontend**: Firebase Hosting (existing setup)
- **Backend**: Vercel Serverless Functions (existing setup)

---

## 🚀 Deployment Steps

### Option 1: Deploy Everything (Recommended)

```bash
# From project root directory

# 1. Ensure you're on the main branch
git status

# 2. Build the frontend
npm run build

# 3. Deploy to Firebase
firebase deploy --only hosting

# 4. Deploy Vercel functions (if using Vercel)
# The api/ folder should auto-deploy when you push to GitHub
git add .
git commit -m "Enhanced chatbot: provider timings + animal type clarification"
git push origin main

# Vercel will auto-deploy from GitHub
```

### Option 2: Deploy Only Backend (Vercel)

```bash
# Navigate to api directory
cd api

# Install dependencies if needed
npm install

# Deploy to Vercel
vercel --prod

# Or push to GitHub (if Vercel is connected)
cd ..
git add api/generate-ai-response.js
git commit -m "Update AI prompt with timings and animal type logic"
git push origin main
```

### Option 3: Deploy Only Frontend (Firebase)

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or use the deployment script if you have one
./deploy.sh
```

---

## ⚙️ Pre-Deployment Checklist

Before deploying, verify:

### Backend Requirements
- [ ] Vercel project is set up and connected
- [ ] `GEMINI_API_KEY` environment variable is set in Vercel
- [ ] Firebase Admin credentials are configured (if using)
- [ ] API endpoint is accessible: `/api/generate-ai-response`

### Frontend Requirements
- [ ] Firebase project is initialized
- [ ] Build completes without errors (`npm run build`)
- [ ] No console errors in development mode
- [ ] Chatbot opens and closes properly

### Data Requirements
- [ ] Providers in Firestore have `businessHours` field
- [ ] Services are marked with `isActive: true`
- [ ] Test data exists for verification

---

## 🔍 Post-Deployment Verification

### 1. Check Backend Deployment

```bash
# Test the API endpoint
curl -X POST https://your-vercel-domain.vercel.app/api/generate-ai-response \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "sessionId": "test-123"
  }'
```

Expected response:
```json
{
  "success": true,
  "reply": "Hi! Ask me anything about your pet care needs.",
  "sessionId": "test-123"
}
```

### 2. Check Frontend Deployment

1. Visit your deployed site: `https://fyppp-5b4f0.web.app`
2. Open browser console (F12)
3. Look for: `"✅ Fetched X services and Y providers (with timings)"`
4. Open chatbot (bottom right)
5. Send a test message

### 3. Test Enhanced Features

Run these quick tests:

**Test Provider Timings:**
```
User: What are the timings for [provider name]?
Expected: Should show business hours
```

**Test Animal Type:**
```
User: I need grooming
Expected: Should ask "Is this for a dog, cat, or another type of animal?"
```

---

## 🐛 Troubleshooting

### Issue: Chatbot doesn't show provider timings

**Possible Causes:**
1. Providers don't have `businessHours` in Firestore
2. Frontend not fetching business hours
3. Backend not receiving business hours in context

**Solutions:**
```javascript
// Check Firestore data structure
// In Firebase Console > Firestore > users collection
// Provider documents should have:
{
  "businessHours": {
    "monday": { "open": "09:00", "close": "17:00", "isOpen": true },
    "tuesday": { "open": "09:00", "close": "17:00", "isOpen": true },
    // ... other days
  }
}
```

**Verify in Browser Console:**
```javascript
// Should see this log
"✅ Fetched X services and Y providers (with timings)"
```

### Issue: Chatbot doesn't ask about animal type

**Possible Causes:**
1. Backend API not updated
2. System prompt not being used
3. Gemini API using cached responses

**Solutions:**
1. Verify Vercel deployment completed
2. Check Vercel logs for errors
3. Clear browser cache
4. Try with a new session ID

### Issue: "Service unavailable" errors

**Possible Causes:**
1. Vercel function not deployed
2. API key not configured
3. CORS issues

**Solutions:**
```bash
# Check Vercel deployment status
vercel logs

# Verify environment variables
vercel env ls

# Redeploy if needed
vercel --prod
```

---

## 📊 Monitoring

### Key Metrics to Watch

1. **Response Time**: Should be < 5 seconds
2. **Success Rate**: Should be > 95%
3. **User Engagement**: Chat messages per session
4. **Error Rate**: Should be < 5%

### Logs to Monitor

**Frontend Logs (Browser Console):**
```
✅ Fetched X services and Y providers (with timings)
🤖 Sending message to AI...
✅ AI response received
```

**Backend Logs (Vercel Dashboard):**
```
📊 Using context data from request...
   - Services found: X
   - Providers found: Y
✅ Context built with real data
✅ AI response generated for session: [sessionId]
```

---

## 🔄 Rollback Procedure

If issues occur after deployment:

### Quick Rollback

```bash
# Revert the changes
git revert HEAD
git push origin main

# Or checkout previous version
git checkout [previous-commit-hash] -- src/components/Chatbot.jsx
git checkout [previous-commit-hash] -- api/generate-ai-response.js
git add .
git commit -m "Rollback chatbot changes"
git push origin main
```

### Manual Revert

1. **Frontend**: Deploy previous build
   ```bash
   firebase hosting:rollback
   ```

2. **Backend**: Redeploy previous version via Vercel dashboard
   - Go to Vercel dashboard
   - Find previous deployment
   - Click "Promote to Production"

---

## 🔐 Security Considerations

### API Keys
- [ ] Gemini API key is in environment variables (not in code)
- [ ] Firebase credentials are properly secured
- [ ] CORS is configured correctly

### Data Privacy
- [ ] Chat history is user-specific
- [ ] No sensitive data in logs
- [ ] Session IDs are unique and secure

---

## 📞 Support Contacts

If you need help with deployment:

1. **Check Documentation**: See `CHATBOT_ENHANCED_FEATURES.md`
2. **Review Logs**: Vercel Dashboard + Browser Console
3. **Test Locally**: Run `npm start` and test before deploying
4. **Verify Data**: Check Firestore for proper structure

---

## ✅ Deployment Completion Checklist

Mark as complete when verified:

### Pre-Deployment
- [ ] Code changes reviewed
- [ ] Local testing completed
- [ ] No console errors
- [ ] Build succeeds

### Deployment
- [ ] Frontend deployed to Firebase
- [ ] Backend deployed to Vercel
- [ ] Environment variables verified
- [ ] No deployment errors

### Post-Deployment
- [ ] Frontend loads without errors
- [ ] Chatbot opens successfully
- [ ] Provider timings feature works
- [ ] Animal type clarification works
- [ ] All test cases pass (see CHATBOT_TESTING_GUIDE.md)

### Monitoring
- [ ] Response times are acceptable
- [ ] No error spikes in logs
- [ ] User feedback is positive
- [ ] Feature adoption is tracked

---

## 🎉 Deployment Complete!

Once all checklist items are complete:

1. Update status in `CHATBOT_ENHANCED_FEATURES.md`
2. Notify team/users of new features
3. Monitor for first 24 hours
4. Gather user feedback
5. Plan next enhancements

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Version**: 2.0 (Enhanced Features)  
**Status**: ⏳ PENDING / ✅ COMPLETE  

---

## Quick Commands Reference

```bash
# Full deployment
npm run build && firebase deploy --only hosting && git push

# Frontend only
npm run build && firebase deploy --only hosting

# Backend only (if manual)
cd api && vercel --prod

# Check status
vercel ls
firebase projects:list

# View logs
vercel logs
firebase functions:log

# Rollback
firebase hosting:rollback
```


