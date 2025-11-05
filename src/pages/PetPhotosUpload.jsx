/**
 * Pet Photos Upload Page
 * Dedicated page for uploading pet photos
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../context/AuthContext";
import UploadPost from "../components/UploadPost";
import { FiArrowLeft } from "react-icons/fi";

export default function PetPhotosUpload() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Fetch user's pets
    const fetchPets = async () => {
      try {
        const q = query(
          collection(db, "pets"),
          where("ownerId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const petsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [currentUser, navigate]);

  const handleUploadSuccess = () => {
    // Navigate to feed after successful upload
    setTimeout(() => {
      navigate("/pet-photos/feed");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/pet-photos/feed")}
          className="flex items-center text-gray-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Feed
        </button>

        {/* Upload Component */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              You need to add a pet before uploading photos.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Add Pet
            </button>
          </div>
        ) : (
          <UploadPost pets={pets} onUploadSuccess={handleUploadSuccess} />
        )}
      </div>
    </div>
  );
}

