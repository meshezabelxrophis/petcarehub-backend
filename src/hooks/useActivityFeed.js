import { useState, useEffect, useCallback } from 'react';
import { activityFeedService } from '../services/realtimeDatabase';

/**
 * Custom hook for real-time activity feed
 * @param {string} userId - User ID
 * @param {number} limit - Max number of activities
 * @returns {object} { activities, addActivity, markAsRead, clearFeed, isLoading, error }
 */
export const useActivityFeed = (userId, limit = 20) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add activity
  const addActivity = useCallback(async (type, message, metadata = {}) => {
    try {
      await activityFeedService.addActivity(userId, type, message, metadata);
      console.log('✅ Activity added successfully');
    } catch (err) {
      console.error('❌ Error adding activity:', err);
      setError(err.message);
      throw err;
    }
  }, [userId]);

  // Mark activity as read
  const markAsRead = useCallback(async (activityId) => {
    try {
      await activityFeedService.markActivityAsRead(userId, activityId);
      
      // Update local state
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? { ...activity, read: true }
            : activity
        )
      );
      
      console.log('✅ Activity marked as read');
    } catch (err) {
      console.error('❌ Error marking activity as read:', err);
      setError(err.message);
    }
  }, [userId]);

  // Clear all activities
  const clearFeed = useCallback(async () => {
    try {
      await activityFeedService.clearActivityFeed(userId);
      setActivities([]);
      console.log('✅ Activity feed cleared');
    } catch (err) {
      console.error('❌ Error clearing activity feed:', err);
      setError(err.message);
    }
  }, [userId]);

  // Load initial activities and listen to new ones
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    console.log(`🔌 Setting up activity feed for user: ${userId}`);
    setIsLoading(true);
    setError(null);

    // Load initial activities
    activityFeedService.getActivityFeed(userId, limit).then((feed) => {
      setActivities(feed);
      setIsLoading(false);
    }).catch((err) => {
      console.error('❌ Error loading activity feed:', err);
      setError(err.message);
      setIsLoading(false);
    });

    // Listen to new activities
    const unsubscribe = activityFeedService.listenToActivityFeed(
      userId,
      (newActivity) => {
        setActivities((prev) => {
          // Avoid duplicates
          if (prev.some((activity) => activity.id === newActivity.id)) {
            return prev;
          }
          // Add new activity at the beginning (newest first)
          return [newActivity, ...prev].slice(0, limit);
        });
      },
      limit
    );

    // Cleanup
    return () => {
      console.log(`🔇 Cleaning up activity feed for user: ${userId}`);
      unsubscribe();
    };
  }, [userId, limit]);

  // Count unread activities
  const unreadCount = activities.filter((activity) => !activity.read).length;

  return {
    activities,
    addActivity,
    markAsRead,
    clearFeed,
    isLoading,
    error,
    unreadCount
  };
};







