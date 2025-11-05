# Pet Photo Wall - Performance & Optimization Guide

## Overview
This document outlines the performance optimizations and best practices implemented in the Pet Photo Wall feature to ensure it stays within Firebase Spark (free) plan limits while providing a smooth, real-time user experience.

---

## 🎯 Firebase Spark Plan Limits

### Daily Quotas (Free Tier)
- **Firestore Reads**: 50,000 per day
- **Firestore Writes**: 20,000 per day
- **Storage**: 5 GB total
- **Bandwidth**: 1 GB per day
- **Cloud Functions**: Not available on Spark plan

---

## ⚡ Performance Optimizations

### 1. Image Compression & Storage

#### Implementation
```javascript
// Auto-compress images before upload
- Max width: 1600px
- Quality: 80%
- Format: JPEG
- Target size: ≤ 2MB
```

#### Benefits
- Reduces storage usage by ~70%
- Faster uploads and downloads
- Better mobile experience
- Saves bandwidth costs

#### Code Reference
See `src/components/UploadPost.jsx` - `compressImage()` function

---

### 2. Query Optimization

#### Feed Query (PhotoWall)
```javascript
query(
  collection(db, "posts"),
  orderBy("createdAt", "desc"),
  limit(50)  // ← Limit to 50 posts
)
```

#### Leaderboard Query
```javascript
query(
  collection(db, "posts"),
  orderBy("likesCount", "desc"),
  orderBy("createdAt", "desc"),
  limit(10)  // ← Only top 10
)
```

#### Benefits
- Limits reads to 50 per feed load
- Prevents excessive data fetching
- Faster page loads

#### Required Firestore Index
```
Collection: posts
Fields: likesCount (desc), createdAt (desc)
```

**Create this index:**
```bash
firebase firestore:indexes
```
Or Firebase Console will prompt you when you first run the leaderboard query.

---

### 3. Real-Time Updates with onSnapshot

#### Why Not Polling?
❌ **Bad**: Fetching every 5 seconds = 17,280 reads/day per user
✅ **Good**: onSnapshot = 1 read per post update

#### Implementation
```javascript
// Efficient real-time listener
const unsubscribe = onSnapshot(query(...), (snapshot) => {
  // Only pays for actual changes
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") { /* handle */ }
    if (change.type === "modified") { /* handle */ }
    if (change.type === "removed") { /* handle */ }
  });
});
```

#### Benefits
- Only charged for actual document changes
- Real-time updates without polling
- Automatic cleanup on unmount

---

### 4. Like/Comment Debouncing

#### Current Implementation
Each interaction triggers immediate Firestore write.

#### Recommended Enhancement (Optional)
```javascript
// Debounce rapid likes to prevent double-taps
const debouncedLike = debounce(async () => {
  await toggleLike(postId, userId);
}, 300);
```

#### Benefits
- Prevents accidental double-likes
- Reduces write operations
- Better UX on slow connections

---

### 5. Lazy Loading Images

#### Implementation
```jsx
<img 
  src={post.imageUrl} 
  loading="lazy"  // ← Native lazy loading
  alt={post.caption}
/>
```

#### Benefits
- Images only load when visible
- Reduces initial bandwidth
- Faster page loads
- Better mobile performance

---

### 6. Storage Cleanup

#### Post Deletion
```javascript
// Delete from Firestore
await deleteDoc(doc(db, "posts", postId));

// Delete from Storage
const storageRef = ref(storage, post.storageRef);
await deleteObject(storageRef);
```

#### Orphaned Subcollections
⚠️ **Note**: Spark plan can't use Cloud Functions for automatic cleanup.

**Manual cleanup options:**
1. Accept orphaned likes/comments (negligible impact)
2. Periodic manual cleanup script
3. Upgrade to Blaze plan for Cloud Functions

---

### 7. Caching Strategy

#### Browser Caching
Firebase Storage automatically sets cache headers:
```
Cache-Control: public, max-age=3600
```

#### Service Worker (Optional)
For PWA support, cache images locally:
```javascript
// Cache downloaded images
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebasestorage')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

---

## 📊 Estimated Daily Usage

### Typical User (10 minutes/day)

| Action | Count | Reads | Writes |
|--------|-------|-------|--------|
| Load feed | 1 | 50 | 0 |
| View post | 5 | 10 (comments) | 0 |
| Like post | 3 | 3 | 6 |
| Add comment | 2 | 0 | 4 |
| **Total** | - | **63** | **10** |

### 100 Active Users/Day
- **Reads**: 6,300 (12.6% of limit)
- **Writes**: 1,000 (5% of limit)
- **Storage**: ~500 MB (10% of limit)

✅ **Well within Spark plan limits!**

---

## 🚀 Scaling Recommendations

### When to Upgrade to Blaze Plan

**Triggers:**
- More than 500 active daily users
- Approaching 40,000 reads/day
- Need Cloud Functions for:
  - Automatic image optimization
  - Push notifications
  - Scheduled cleanup tasks
  - Advanced analytics

### Optimization Checklist Before Upgrading

- [ ] Implement pagination (load more on scroll)
- [ ] Add client-side caching with React Query
- [ ] Optimize images on upload (already done)
- [ ] Implement debouncing on interactions
- [ ] Use CDN for static assets
- [ ] Monitor usage with Firebase Analytics

---

## 🔍 Monitoring Usage

### Firebase Console
1. Go to Firebase Console → Usage & Billing
2. Monitor:
   - Firestore document reads/writes
   - Storage usage
   - Bandwidth usage

### Set Up Alerts
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Set budget alerts
firebase alerts:create \
  --threshold 80 \
  --metric firestore_reads
```

---

## 🛠️ Performance Testing

### Load Testing Script
```javascript
// test/load-test.js
import { collection, addDoc } from "firebase/firestore";
import { db } from "../src/config/firebase";

async function simulateUsers(numUsers) {
  const promises = [];
  for (let i = 0; i < numUsers; i++) {
    promises.push(
      addDoc(collection(db, "posts"), {
        userId: `test_user_${i}`,
        petName: `Pet ${i}`,
        imageUrl: "https://via.placeholder.com/800",
        caption: "Test post",
        createdAt: new Date(),
        likesCount: 0,
        commentsCount: 0,
      })
    );
  }
  await Promise.all(promises);
  console.log(`Created ${numUsers} test posts`);
}

simulateUsers(50);
```

---

## 📱 Mobile Optimization

### Responsive Images
```javascript
// Use Firebase Storage resizing (Blaze plan only)
// Or implement client-side responsive images:

const getSizedImage = (url, size) => {
  // For now, all images are compressed to 1600px
  // Future: Generate multiple sizes on upload
  return url;
};
```

### Touch Interactions
- Minimum touch target: 44x44px (iOS guidelines)
- Debounce rapid taps
- Visual feedback on interactions

---

## 🔐 Security Best Practices

### Firestore Rules
✅ Implemented in `firestore.rules`:
- Public read for posts
- Authenticated write only
- User can only modify their own content
- Subcollection rules for likes/comments

### Storage Rules
Add to `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /pet_posts/{userId}/{fileName} {
      // Allow public read
      allow read: if true;
      
      // Only authenticated user can write to their folder
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024  // 10MB max
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 📈 Analytics Tracking

### Recommended Events
```javascript
import { logEvent } from "firebase/analytics";

// Track engagement
logEvent(analytics, 'post_shared', {
  pet_type: petSpecies,
  has_caption: !!caption
});

logEvent(analytics, 'post_liked', {
  post_id: postId
});

logEvent(analytics, 'comment_added', {
  post_id: postId
});
```

---

## 🐛 Common Issues & Solutions

### Issue: Slow Image Loads
**Solution**: 
- Images are compressed on upload
- Use lazy loading (implemented)
- Consider using a CDN (future)

### Issue: Hitting Read Limits
**Solution**:
- Implement pagination (scroll to load more)
- Reduce initial limit from 50 to 20
- Add client-side caching

### Issue: Comments Not Updating
**Solution**:
- Check onSnapshot listener is active
- Verify Firestore rules allow read access
- Check browser console for errors

### Issue: Upload Fails
**Solution**:
- Check Storage rules
- Verify authentication
- Check file size < 10MB
- Verify internet connection

---

## 🎓 Best Practices Summary

### DO ✅
- Compress images before upload
- Use limit() on queries
- Implement lazy loading
- Use onSnapshot for real-time updates
- Clean up listeners on unmount
- Monitor Firebase usage regularly

### DON'T ❌
- Upload uncompressed images
- Query without limit()
- Poll for updates (use onSnapshot)
- Forget to unsubscribe from listeners
- Allow unlimited file sizes
- Skip security rules

---

## 🔄 Future Enhancements

### Phase 2 (Optional)
- [ ] Infinite scroll pagination
- [ ] Progressive image loading (blur-up)
- [ ] Video support
- [ ] Stories feature (24h expiry)
- [ ] Direct messaging for posts
- [ ] Advanced search/filters
- [ ] User profiles
- [ ] Follow/followers system

### Phase 3 (Requires Blaze Plan)
- [ ] Push notifications
- [ ] Cloud Functions for image processing
- [ ] Automatic thumbnail generation
- [ ] Content moderation
- [ ] Advanced analytics

---

## 📞 Support

For issues or questions:
1. Check Firebase Console for errors
2. Review browser console logs
3. Check `firestore.rules` are deployed
4. Verify API keys in `.env`

---

## 📝 Version History

- **v1.0** (Current): Initial implementation with all core features
  - Upload with AI captions
  - Real-time feed
  - Likes and comments
  - Leaderboard
  - Full Spark plan optimization

---

**Last Updated**: November 5, 2025
**Maintainer**: PetCare Hub Team

