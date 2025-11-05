/**
 * Post Actions Library
 * Handles all interactions with posts (likes, comments, etc.)
 */

import { db } from "../config/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

/**
 * Toggle like on a post
 * @param {string} postId - Post document ID
 * @param {string} userId - User ID
 */
export async function toggleLike(postId, userId) {
  try {
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const postRef = doc(db, "posts", postId);
    
    const snap = await getDoc(likeRef);
    
    if (snap.exists()) {
      // Unlike: remove the like document and decrement count
      await deleteDoc(likeRef);
      await updateDoc(postRef, { 
        likesCount: increment(-1),
        updatedAt: serverTimestamp()
      });
      return { liked: false };
    } else {
      // Like: create like document and increment count
      await setDoc(likeRef, { 
        liked: true,
        createdAt: serverTimestamp()
      });
      await updateDoc(postRef, { 
        likesCount: increment(1),
        updatedAt: serverTimestamp()
      });
      return { liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

/**
 * Check if user has liked a post
 * @param {string} postId - Post document ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function checkUserLiked(postId, userId) {
  try {
    const likeRef = doc(db, "posts", postId, "likes", userId);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch (error) {
    console.error("Error checking like status:", error);
    return false;
  }
}

/**
 * Add a comment to a post
 * @param {string} postId - Post document ID
 * @param {string} userId - User ID
 * @param {string} userName - User display name
 * @param {string} text - Comment text
 */
export async function addComment(postId, userId, userName, text) {
  try {
    const commentsRef = collection(db, "posts", postId, "comments");
    const postRef = doc(db, "posts", postId);
    
    // Add comment document
    const commentDoc = await addDoc(commentsRef, {
      userId,
      userName: userName || "Anonymous",
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    
    // Increment comments count
    await updateDoc(postRef, { 
      commentsCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    return commentDoc.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

/**
 * Delete a comment from a post
 * @param {string} postId - Post document ID
 * @param {string} commentId - Comment document ID
 */
export async function deleteComment(postId, commentId) {
  try {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const postRef = doc(db, "posts", postId);
    
    // Delete comment document
    await deleteDoc(commentRef);
    
    // Decrement comments count
    await updateDoc(postRef, { 
      commentsCount: increment(-1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}

/**
 * Delete a post and its associated data
 * @param {string} postId - Post document ID
 */
export async function deletePost(postId) {
  try {
    const postRef = doc(db, "posts", postId);
    await deleteDoc(postRef);
    
    // Note: Subcollections (likes, comments) should be deleted via Cloud Functions
    // or manually in production. For Spark plan, we'll leave them orphaned
    // as they won't affect functionality and will auto-expire based on rules
    
    console.log("Post deleted successfully:", postId);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

/**
 * Update post caption
 * @param {string} postId - Post document ID
 * @param {string} newCaption - New caption text
 */
export async function updatePostCaption(postId, newCaption) {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      caption: newCaption.trim(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating caption:", error);
    throw error;
  }
}

/**
 * Get post statistics
 * @param {string} postId - Post document ID
 * @returns {Promise<Object>} - { likesCount, commentsCount }
 */
export async function getPostStats(postId) {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
      const data = postSnap.data();
      return {
        likesCount: data.likesCount || 0,
        commentsCount: data.commentsCount || 0,
      };
    }
    return { likesCount: 0, commentsCount: 0 };
  } catch (error) {
    console.error("Error getting post stats:", error);
    return { likesCount: 0, commentsCount: 0 };
  }
}

