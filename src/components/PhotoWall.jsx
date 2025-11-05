/**
 * PhotoWall Component
 * VSCO/Instagram-style photo feed with real-time updates
 */

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import PhotoModal from "./PhotoModal";
import { FiHeart, FiMessageCircle, FiLoader } from "react-icons/fi";

export default function PhotoWall({ userId = null, petId = null }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Build query based on filters
    let q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply client-side filters if needed
        let filteredPosts = postsData;
        if (userId) {
          filteredPosts = filteredPosts.filter((post) => post.userId === userId);
        }
        if (petId) {
          filteredPosts = filteredPosts.filter((post) => post.petId === petId);
        }

        setPosts(filteredPosts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts");
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [userId, petId]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader className="animate-spin text-4xl text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No posts yet. Be the first to share! 🐾</p>
      </div>
    );
  }

  return (
    <>
      {/* VSCO-style minimal grid - tight spacing, clean aesthetic */}
      <div className="grid grid-cols-3 gap-[2px] bg-white">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100"
          >
            {/* Image */}
            <img
              src={post.imageUrl}
              alt={post.caption || "Pet photo"}
              loading="lazy"
              className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
            />
            
            {/* Minimal hover overlay - VSCO style */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex items-center space-x-3 text-white drop-shadow-lg">
                <div className="flex items-center">
                  <FiHeart className="mr-1" size={18} />
                  <span className="font-medium text-sm">{post.likesCount || 0}</span>
                </div>
                <div className="flex items-center">
                  <FiMessageCircle className="mr-1" size={18} />
                  <span className="font-medium text-sm">{post.commentsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPost && (
        <PhotoModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}


