import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Bell, MessageSquare, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const TestNotifications = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTestNotification = async (type, messageText) => {
    if (!currentUser) {
      alert('Please log in first!');
      return;
    }

    setLoading(true);
    try {
      // Create notification in Firestore
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.id,
        type: type,
        title: messageText,
        message: `Test ${type} notification`,
        read: false,
        createdAt: serverTimestamp()
      });
      
      setMessage(`✅ ${messageText}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding notification:', error);
      alert('Failed to add notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p>Please log in to test the notification system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-teal-700 mb-8 text-center">
        🧪 Notification System Test Page
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Logged in as: {currentUser.name} ({currentUser.email})
        </h2>
        <p className="text-gray-600 mb-2">User ID: <code className="bg-gray-100 px-2 py-1 rounded">{currentUser.id}</code></p>
        <p className="text-sm text-gray-500">
          Click any button below to add a test notification. Check the bell icon 🔔 in the navbar!
        </p>
      </div>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg mb-6">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Notification */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="text-blue-500 mr-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">Booking Notification</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Simulate a new booking confirmation notification
          </p>
          <button
            onClick={() => addTestNotification(
              'booking',
              '📅 New booking confirmed for Pet Grooming on March 15, 2025 at 2:00 PM'
            )}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Booking Notification'}
          </button>
        </div>

        {/* Message Notification */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <MessageSquare className="text-purple-500 mr-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">Message Notification</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Simulate a new chat message notification
          </p>
          <button
            onClick={() => addTestNotification(
              'message',
              '💬 New message from Dr. Sarah: "Your appointment is confirmed!"'
            )}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Message Notification'}
          </button>
        </div>

        {/* Safe Zone Alert */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="text-red-500 mr-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">Safe Zone Alert</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Simulate a pet leaving the safe zone
          </p>
          <button
            onClick={() => addTestNotification(
              'safe_zone_alert',
              '⚠️ ALERT: Buddy has left the safe zone! Last seen at Main Street Park.'
            )}
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Safe Zone Alert'}
          </button>
        </div>

        {/* General Notification */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="text-teal-500 mr-3" size={32} />
            <h3 className="text-xl font-semibold text-gray-800">General Notification</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Add a custom notification message
          </p>
          <button
            onClick={() => addTestNotification(
              'general',
              '🎉 Welcome to PetCare Hub! Your profile has been created successfully.'
            )}
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add General Notification'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          How to Test
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-900">
          <li>Click any button above to add a test notification</li>
          <li>Look at the notification bell 🔔 in the navbar (top right)</li>
          <li>You should see a red badge with the number of unread notifications</li>
          <li>Click the bell to see the notification dropdown</li>
          <li>Click on a notification to mark it as read</li>
          <li>Click "Mark all as read" to clear all notifications</li>
        </ol>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          📝 Note about Emulators
        </h3>
        <p className="text-yellow-900">
          <strong>Current Mode:</strong> {process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true' ? '🟢 Emulator Mode' : '🔴 Production Mode'}
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          {process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true' 
            ? 'You are using Firebase Emulators. Data will be lost when emulators restart.'
            : 'You are using production Firebase. All notifications are real!'}
        </p>
      </div>
    </div>
  );
};

export default TestNotifications;



