/**
 * PhotoModal Component
 * Full-screen photo viewer with likes and comments
 */

import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import {
  toggleLike,
  checkUserLiked,
  addComment,
  deleteComment,
} from "../lib/postActions";
import {
  notifyPostLiked,
  notifyPostCommented,
} from "../services/notificationService";
import {
  FiX,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import { IoMdHeart } from "react-icons/io";

export default function PhotoModal({ post, onClose }) {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const commentInputRef = useRef(null);

  const isOwner = currentUser?.uid === post.userId;

  // Check if user has liked this post
  useEffect(() => {
    if (currentUser) {
      checkUserLiked(post.id, currentUser.uid).then(setIsLiked);
    }
  }, [post.id, currentUser]);

  // Subscribe to comments in real-time
  useEffect(() => {
    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [post.id]);

  // Subscribe to post updates (for like/comment counts)
  useEffect(() => {
    const postRef = doc(db, "posts", post.id);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setLikesCount(data.likesCount || 0);
        setCommentsCount(data.commentsCount || 0);
      }
    });

    return () => unsubscribe();
  }, [post.id]);

  // Handle like toggle
  const handleLike = async () => {
    if (!currentUser) {
      alert("Please log in to like posts");
      return;
    }

    try {
      const result = await toggleLike(post.id, currentUser.uid);
      setIsLiked(result.liked);
      
      // Send notification to post owner (only if liking, not unliking)
      if (result.liked && post.userId !== currentUser.uid) {
        const likerName = currentUser.displayName || currentUser.email || "Someone";
        await notifyPostLiked(post.userId, likerName, post.id, post.petName);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const commenterName = currentUser.displayName || currentUser.email || "Anonymous";
      await addComment(
        post.id,
        currentUser.uid,
        commenterName,
        newComment
      );
      
      // Send notification to post owner (only if not commenting on own post)
      if (post.userId !== currentUser.uid) {
        await notifyPostCommented(post.userId, commenterName, newComment, post.id, post.petName);
      }
      
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await deleteComment(post.id, commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "posts", post.id));

      // Delete from Storage if path exists
      if (post.storageRef) {
        try {
          const storageRef = ref(storage, post.storageRef);
          await deleteObject(storageRef);
        } catch (err) {
          console.warn("Could not delete storage file:", err);
        }
      }

      alert("Post deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="md:w-3/5 bg-black flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt={post.caption || "Pet photo"}
            className="w-full h-full object-contain max-h-[50vh] md:max-h-full"
          />
        </div>

        {/* Info Section */}
        <div className="md:w-2/5 flex flex-col max-h-[40vh] md:max-h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-semibold">
                  {post.petName?.charAt(0) || "P"}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{post.petName || "Pet"}</h3>
                <p className="text-xs text-gray-500">{post.userName || "User"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOwner && (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full relative"
                >
                  <FiMoreVertical />
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 w-32 z-10">
                      <button
                        onClick={handleDeletePost}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <FiTrash2 className="mr-2" size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Caption */}
            {post.caption && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-600 text-sm font-semibold">
                    {post.petName?.charAt(0) || "P"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{post.petName || "Pet"}</span>
                    {post.caption}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(post.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Comments */}
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 text-sm font-semibold">
                    {comment.userName?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold mr-2">{comment.userName}</span>
                    {comment.text}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(comment.createdAt)}
                    </p>
                    {currentUser?.uid === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                No comments yet. Be the first! 💬
              </p>
            )}
          </div>

          {/* Actions Bar */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-4 mb-3">
              <button
                onClick={handleLike}
                className="focus:outline-none transition-transform active:scale-125"
                disabled={!currentUser}
              >
                {isLiked ? (
                  <IoMdHeart size={28} className="text-red-500" />
                ) : (
                  <FiHeart size={28} className="text-gray-700 hover:text-red-500" />
                )}
              </button>
              <button
                onClick={() => commentInputRef.current?.focus()}
                className="focus:outline-none"
              >
                <FiMessageCircle size={26} className="text-gray-700" />
              </button>
            </div>

            <p className="text-sm font-semibold mb-2">
              {likesCount} {likesCount === 1 ? "like" : "likes"}
            </p>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <FiSend size={18} />
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Log in to like and comment
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

