import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LiveGPSMap from '../components/LiveGPSMap';
import RealtimeChat from '../components/RealtimeChat';
import ActivityFeedPanel from '../components/ActivityFeedPanel';
import { gpsTrackingService } from '../services/realtimeDatabase';
import { activityFeedService } from '../services/realtimeDatabase';

/**
 * Demo page showcasing all three realtime features:
 * 1. Live GPS Tracking
 * 2. Realtime Chat
 * 3. Activity Feed
 */
const LiveFeaturesDemo = () => {
  const { currentUser } = useAuth();
  const [selectedPetId, setSelectedPetId] = useState('pet_123'); // Example pet ID
  const [chatUserId, setChatUserId] = useState('user_456'); // Example user ID
  const [activeTab, setActiveTab] = useState('gps'); // gps, chat, activity

  // Demo: Simulate GPS update
  const handleSimulateGPSUpdate = async () => {
    const randomLat = 33.6844 + (Math.random() - 0.5) * 0.01;
    const randomLng = 73.0479 + (Math.random() - 0.5) * 0.01;
    
    try {
      await gpsTrackingService.updateLocation(selectedPetId, randomLat, randomLng, {
        accuracy: 10,
        battery: Math.floor(Math.random() * 100),
        speed: Math.floor(Math.random() * 10)
      });
      alert('GPS location updated!');
    } catch (error) {
      console.error('Error updating GPS:', error);
      alert('Failed to update GPS: ' + error.message);
    }
  };

  // Demo: Add test activity
  const handleAddTestActivity = async () => {
    try {
      await activityFeedService.addActivity(
        currentUser.id,
        'booking',
        `New booking created at ${new Date().toLocaleTimeString()}`,
        { demo: true }
      );
      alert('Activity added!');
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('Failed to add activity: ' + error.message);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access live features.</p>
          <a
            href="/login"
            className="block w-full text-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔥 Firebase Realtime Features Demo
          </h1>
          <p className="text-gray-600">
            Test live GPS tracking, realtime chat, and activity feed - all powered by Firebase Realtime Database!
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Connected to Realtime Database</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('gps')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'gps'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📍 GPS Tracking
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 Realtime Chat
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔔 Activity Feed
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'gps' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Live GPS Tracking</h2>
                    <p className="text-sm text-gray-600">Real-time pet location updates</p>
                  </div>
                  <button
                    onClick={handleSimulateGPSUpdate}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                  >
                    Simulate GPS Update
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pet ID to Track:
                  </label>
                  <input
                    type="text"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter pet ID"
                  />
                </div>

                <LiveGPSMap petId={selectedPetId} petName="Demo Pet" height={500} />

                <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Updates automatically when GPS data changes (no refresh needed)</li>
                    <li>• Uses Firebase Realtime Database listeners (onValue)</li>
                    <li>• Click "Simulate GPS Update" to see live updates</li>
                    <li>• Map auto-centers on new location</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Realtime Chat</h2>
                  <p className="text-sm text-gray-600 mb-4">Instant messaging with live updates</p>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chat with User ID:
                  </label>
                  <input
                    type="text"
                    value={chatUserId}
                    onChange={(e) => setChatUserId(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter user ID"
                  />
                </div>

                <div className="h-96">
                  <RealtimeChat otherUserId={chatUserId} otherUserName="Demo User" />
                </div>

                <div className="mt-4 bg-purple-50 border-l-4 border-purple-500 p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Messages appear instantly (no polling)</li>
                    <li>• Uses onChildAdded listener for new messages</li>
                    <li>• Auto-scrolls to newest message</li>
                    <li>• Open another tab to test two-way chat</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
                    <p className="text-sm text-gray-600">Live activity notifications</p>
                  </div>
                  <button
                    onClick={handleAddTestActivity}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm"
                  >
                    Add Test Activity
                  </button>
                </div>

                <ActivityFeedPanel limit={20} />

                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <h3 className="font-semibold text-green-900 mb-2">How it works:</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• New activities appear instantly at the top</li>
                    <li>• Uses onChildAdded listener with timestamp ordering</li>
                    <li>• Click activities to mark as read</li>
                    <li>• Unread count updates automatically</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">User:</span>
                  <p className="text-gray-600">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <p className="text-gray-600">{currentUser.role}</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
              <h4 className="font-semibold text-teal-900 mb-2">💡 Tip</h4>
              <p className="text-sm text-teal-800">
                All three features work in real-time! Changes appear instantly without page refresh.
              </p>
            </div>

            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Real-time GPS tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Instant messaging</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Live activity feed</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>No page refresh needed</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Automatic cleanup</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeaturesDemo;







