/**
 * UploadPost Component
 * Allows users to upload pet photos with AI-generated captions
 */

import React, { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import { FiUpload, FiX, FiImage, FiLoader } from "react-icons/fi";
import { API_BASE_URL } from "../config/api";

// Simple image compression function (no external library needed)
const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function UploadPost({ pets = [], onUploadSuccess }) {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB max before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    try {
      // Compress image
      const compressedFile = await compressImage(file);
      setSelectedFile(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(compressedFile);
      
      setError(null);
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to process image");
    }
  };

  // Generate AI caption
  const generateAICaption = async (imageUrl) => {
    setGeneratingCaption(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generateCaption`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate caption");
      }

      const data = await response.json();
      setCaption(data.caption || "");
      
      if (data.mock || data.fallback) {
        console.warn("Using fallback caption");
      }
    } catch (err) {
      console.error("Error generating caption:", err);
      setCaption("My adorable pet! 🐾");
    } finally {
      setGeneratingCaption(false);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !selectedPetId) {
      setError("Please select a photo and pet");
      return;
    }

    if (!currentUser) {
      setError("You must be logged in to post");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Find selected pet details
      const selectedPet = pets.find(p => p.id === selectedPetId);
      const petName = selectedPet?.name || "My Pet";

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${currentUser.uid}_${timestamp}.jpg`;
      const storageRef = ref(storage, `pet_posts/${currentUser.uid}/${fileName}`);

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setError("Failed to upload image");
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Generate AI caption if not already set
            if (!caption || caption.trim() === "") {
              await generateAICaption(downloadURL);
            }

            // Wait a moment to ensure caption is set
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create post document in Firestore
            const postData = {
              userId: currentUser.uid,
              userName: currentUser.displayName || currentUser.email || "Anonymous",
              userEmail: currentUser.email,
              petId: selectedPetId,
              petName: petName,
              imageUrl: downloadURL,
              caption: caption || "Check out my pet! 🐾",
              createdAt: serverTimestamp(),
              likesCount: 0,
              commentsCount: 0,
              storageRef: storageRef.fullPath, // Store path for deletion later
            };

            const docRef = await addDoc(collection(db, "posts"), postData);
            console.log("✅ Post created:", docRef.id);

            // Reset form
            setSelectedFile(null);
            setPreviewUrl(null);
            setCaption("");
            setSelectedPetId("");
            setUploadProgress(0);
            setUploading(false);

            // Notify parent
            if (onUploadSuccess) {
              onUploadSuccess();
            }

            alert("Post uploaded successfully! 🎉");
          } catch (err) {
            console.error("Error creating post:", err);
            setError("Failed to create post");
            setUploading(false);
          }
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload post");
      setUploading(false);
    }
  };

  // Clear selection
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <FiUpload className="mr-2 text-teal-600" />
        Share Your Pet's Moment
      </h2>

      {/* Pet Selection */}
      {pets && pets.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Pet
          </label>
          <select
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={uploading}
          >
            <option value="">Choose a pet...</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species || pet.breed || "Pet"})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* File Input */}
      {!previewUrl && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
        >
          <FiImage className="mx-auto text-5xl text-gray-400 mb-3" />
          <p className="text-gray-600 mb-2">Click to upload a photo</p>
          <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="mb-4 relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            <FiX size={20} />
          </button>
        </div>
      )}

      {/* Caption Input */}
      {previewUrl && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption {generatingCaption && <span className="text-teal-600">(Generating...)</span>}
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption or let AI generate one..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            disabled={uploading || generatingCaption}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {previewUrl && (
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedPetId || generatingCaption}
          className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {uploading ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Uploading...
            </>
          ) : generatingCaption ? (
            <>
              <FiLoader className="animate-spin mr-2" />
              Generating Caption...
            </>
          ) : (
            "Share Post"
          )}
        </button>
      )}
    </div>
  );
}

