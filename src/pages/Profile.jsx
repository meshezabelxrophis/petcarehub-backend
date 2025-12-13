import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../config/backend";

function Profile() {
  const { currentUser, isServiceProvider } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    services: [],
    businessHours: {
      monday: { open: "09:00", close: "17:00", isOpen: true },
      tuesday: { open: "09:00", close: "17:00", isOpen: true },
      wednesday: { open: "09:00", close: "17:00", isOpen: true },
      thursday: { open: "09:00", close: "17:00", isOpen: true },
      friday: { open: "09:00", close: "17:00", isOpen: true },
      saturday: { open: "10:00", close: "15:00", isOpen: true },
      sunday: { open: "10:00", close: "15:00", isOpen: false }
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    if (currentUser) {
      // In a real app, we would fetch the complete profile from the backend
      // For now, we'll use the currentUser data and add some dummy data
      setProfileData(prev => ({
        ...prev,
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "Professional pet care provider with over 5 years of experience."
      }));
      
      // Fetch provider profile data from backend
      const fetchProfileData = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(API_ENDPOINTS.PROVIDER_PROFILE(currentUser.id), {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            setProfileData(prev => ({
              ...prev,
              ...data
            }));
          }
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        }
      };
      
      fetchProfileData();
    }
  }, [currentUser]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleBusinessHoursChange = (day, field, value) => {
    setProfileData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.PROVIDER_PROFILE(currentUser.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (res.ok) {
        setMessage("Profile updated successfully");
        setIsEditing(false);
        
        // Refresh profile completion status
        if (window.refreshProfileCompletion) {
          setTimeout(() => {
            window.refreshProfileCompletion();
          }, 1000);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to update profile:", errorData);
        setMessage(`Failed to update profile: ${errorData.error || res.statusText}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(`An error occurred while updating profile: ${error.message}`);
    }
  };
  
  if (!currentUser) {
    return <div className="p-8 text-center">Please login to view your profile</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">User Profile Page</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
              
              {isServiceProvider && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profileData.businessHours).map(([day, hours]) => (
                      <div key={day} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{day}</span>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={hours.isOpen}
                              onChange={(e) => handleBusinessHoursChange(day, "isOpen", e.target.checked)}
                              className="form-checkbox h-5 w-5 text-teal-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">Open</span>
                          </label>
                        </div>
                        
                        {hours.isOpen && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Open</label>
                              <input
                                type="time"
                                value={hours.open}
                                onChange={(e) => handleBusinessHoursChange(day, "open", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">Close</label>
                              <input
                                type="time"
                                value={hours.close}
                                onChange={(e) => handleBusinessHoursChange(day, "close", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-gray-600 font-medium">Full Name</h3>
                  <p className="text-gray-800">{profileData.name}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-600 font-medium">Email Address</h3>
                  <p className="text-gray-800">{profileData.email}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-600 font-medium">Phone Number</h3>
                  <p className="text-gray-800">{profileData.phone || "Not provided"}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-600 font-medium">Address</h3>
                  <p className="text-gray-800">{profileData.address || "Not provided"}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-gray-600 font-medium">Bio</h3>
                <p className="text-gray-800">{profileData.bio}</p>
              </div>
              
              {isServiceProvider && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(profileData.businessHours).map(([day, hours]) => (
                      <div key={day} className="border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{day}</span>
                          <span className={`text-sm ${hours.isOpen ? "text-green-600" : "text-red-600"}`}>
                            {hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isServiceProvider && (
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manage Services</h2>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Configure the services you offer to pet owners</p>
              <button
                onClick={() => navigate("/my-services")}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Manage Services
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isServiceProvider && (
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Management</h2>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">View and manage your customer bookings</p>
              <button
                onClick={() => navigate("/manage-bookings")}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Manage Bookings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 