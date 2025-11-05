# 🚀 Pet Photo Wall - Deployment Guide

## Quick Start (5 Minutes)

### Step 1: Deploy Firebase Rules (Required)
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# This will update security rules for the posts collection
```

### Step 2: Update Storage Rules (Required)
Edit `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pet_posts/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Deploy:
```bash
firebase deploy --only storage:rules
```

### Step 3: Set Up Gemini API (Optional but Recommended)
1. Get API key: https://makersuite.google.com/app/apikey
2. Add to Vercel:
```bash
vercel env add GEMINI_API_KEY
```
Enter your API key when prompted.

3. Redeploy Vercel:
```bash
vercel --prod
```

**Note**: Works without API key (uses fallback captions)

### Step 4: Test the Feature
1. Navigate to `/pet-photos/feed`
2. Try uploading a photo at `/pet-photos/upload`
3. Like and comment on posts
4. Check leaderboard at `/pet-photos/leaderboard`

### Step 5: Create Firestore Index
When you first visit the leaderboard, Firestore will show an error with a link.
Click the link to auto-create the required index, or:

**Manual creation:**
- Go to Firebase Console → Firestore → Indexes
- Create composite index:
  - Collection: `posts`
  - Fields: `likesCount` (DESC), `createdAt` (DESC)

Wait 2-5 minutes for index to build.

---

## ✅ Deployment Checklist

- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Gemini API key added to Vercel (optional)
- [ ] Tested upload functionality
- [ ] Tested real-time updates
- [ ] Firestore index created
- [ ] Tested on mobile device
- [ ] Added navigation links
- [ ] Announced feature to users

---

## 🎉 You're Done!

Your pet photo wall is now live and ready for users!

**Test URLs:**
- Feed: https://your-domain.com/pet-photos/feed
- Upload: https://your-domain.com/pet-photos/upload
- Leaderboard: https://your-domain.com/pet-photos/leaderboard

---

## 🔍 Troubleshooting

### "Permission Denied" on upload
- Check Firestore rules are deployed
- Check Storage rules are deployed
- Verify user is logged in as petOwner

### AI captions not working
- Check `GEMINI_API_KEY` in Vercel env vars
- Fallback captions will be used if key is missing (this is OK)

### Leaderboard shows index error
- Click the error link to create index
- Wait 2-5 minutes for completion

---

## 📊 Monitor Usage

Check Firebase Console → Usage & Billing to ensure you stay within Spark plan limits:
- Reads: 50,000/day
- Writes: 20,000/day
- Storage: 5 GB total

With 100 active users, you'll use:
- ~6,300 reads/day (12.6% of limit)
- ~1,000 writes/day (5% of limit)

✅ Well within free tier!

---

## 🎨 Customization (Optional)

### Change feed limit
In `src/components/PhotoWall.jsx`:
```javascript
limit(50)  // Change to 20, 30, etc.
```

### Change compression settings
In `src/components/UploadPost.jsx`:
```javascript
const maxWidth = 1600;  // Max image width
const quality = 0.8;    // JPEG quality (0.0-1.0)
```

### Change theme colors
Already using your teal theme! All styles match existing design.

---

## 📱 Share with Users

**Announcement Template:**

> 🎉 New Feature: Pet Photo Wall!
> 
> Share your pet's best moments with our community!
> 
> ✨ Features:
> • Upload beautiful pet photos
> • AI-generated captions
> • Like and comment on posts
> • Compete for most loved pet
> • Real-time updates
> 
> Try it now: [Your Domain]/pet-photos/feed

---

## 🔄 Future Updates

See `PET_PHOTO_WALL_README.md` for:
- Phase 2 enhancements
- Performance optimizations
- Advanced features

---

**Need Help?**
- Check `PERFORMANCE.md` for optimization details
- Check `PET_PHOTO_WALL_README.md` for full documentation
- Review Firestore rules in `firestore.rules`

**Congratulations! 🎊**
Your Instagram-style pet photo wall is live!

