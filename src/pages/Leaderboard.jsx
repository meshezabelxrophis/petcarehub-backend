/**
 * Leaderboard Page
 * Shows the most liked pet posts in real-time
 */

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { FiTrendingUp, FiHeart, FiMessageCircle, FiLoader, FiAward } from "react-icons/fi";
import { IoMdPaw } from "react-icons/io";
import PhotoModal from "../components/PhotoModal";

export default function Leaderboard() {
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Query top 10 posts by likes count
    // Note: Requires Firestore index - will be prompted on first load
    const q = query(
      collection(db, "posts"),
      orderBy("likesCount", "desc"),
      limit(10)
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data(),
        }));
        setTopPosts(posts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Get medal/trophy for top 3
  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: "🥇", color: "text-yellow-500", bg: "bg-yellow-50" };
    if (rank === 2) return { icon: "🥈", color: "text-gray-400", bg: "bg-gray-50" };
    if (rank === 3) return { icon: "🥉", color: "text-orange-500", bg: "bg-orange-50" };
    return { icon: rank, color: "text-gray-600", bg: "bg-gray-50" };
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <FiLoader className="animate-spin text-4xl text-teal-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FiAward className="text-5xl text-teal-600 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Top Pets
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Most loved pets on PetCare Hub 🐾
          </p>
        </div>

        {/* Leaderboard */}
        {topPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <IoMdPaw className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              No posts yet. Be the first to share!
            </p>
            <button
              onClick={() => navigate("/pet-photos/upload")}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Upload Photo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {topPosts.map((post) => {
              const badge = getRankBadge(post.rank);
              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center p-4 md:p-6">
                    {/* Rank Badge */}
                    <div
                      className={`${badge.bg} ${badge.color} w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0 mr-4 shadow-sm`}
                    >
                      {badge.icon}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 mr-4 shadow-sm">
                      <img
                        src={post.imageUrl}
                        alt={post.petName || "Pet"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        {post.petName || "Pet"}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        by {post.userName || "User"}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                        {post.caption}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiHeart className="text-red-500 mr-1" />
                          <span className="font-semibold">{post.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FiMessageCircle className="text-teal-600 mr-1" />
                          <span>{post.commentsCount || 0}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Trophy for top 3 */}
                    {post.rank <= 3 && (
                      <div className="hidden md:block">
                        <FiTrendingUp className={`text-3xl ${badge.color}`} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/pet-photos/feed")}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-md"
          >
            View All Posts
          </button>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPost && (
        <PhotoModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}

