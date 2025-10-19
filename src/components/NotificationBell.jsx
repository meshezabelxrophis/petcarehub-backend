import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';

/**
 * Notification Bell Component
 * Displays real-time notifications from Cloud Functions
 * Shows: bookings, safe zone alerts, messages
 */
const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to notifications in real-time
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    console.log('🔔 Setting up notification listener for:', currentUser.id);

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.id),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.read).length);
        setIsLoading(false);

        console.log(`📬 Loaded ${notifs.length} notifications, ${notifs.filter((n) => !n.read).length} unread`);
      },
      (error) => {
        console.error('❌ Error loading notifications:', error);
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🔇 Cleaning up notification listener');
      unsubscribe();
    };
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
      });
      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifs.map((n) =>
          updateDoc(doc(db, 'notifications', n.id), { read: true })
        )
      );
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_booking':
      case 'booking_status_change':
        return '📅';
      case 'safe_zone_alert':
        return '⚠️';
      case 'new_message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // More than 24 hours
    return date.toLocaleDateString();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          ></div>

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-teal-600 text-white rounded-t-lg">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-teal-100 hover:text-white transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-80">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-teal-500 border-t-transparent"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-teal-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? 'font-semibold text-gray-900'
                              : 'text-gray-700'
                          }`}
                        >
                          {notification.title || notification.message}
                        </p>
                        {notification.title && notification.message && (
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 text-center border-t border-gray-200 rounded-b-lg">
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;






