import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/realtimeDatabase';

/**
 * Custom hook for real-time chat
 * @param {string} chatId - Chat ID
 * @param {string} currentUserId - Current user ID
 * @returns {object} { messages, sendMessage, isLoading, error }
 */
export const useRealtimeChat = (chatId, currentUserId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Send message function
  const sendMessage = useCallback(async (receiverId, text) => {
    if (!text.trim()) {
      console.warn('⚠️ Cannot send empty message');
      return;
    }

    try {
      await chatService.sendMessage(chatId, currentUserId, receiverId, text.trim());
      console.log('✅ Message sent successfully');
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err.message);
      throw err;
    }
  }, [chatId, currentUserId]);

  // Load chat history and listen to new messages
  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      return;
    }

    console.log(`🔌 Setting up chat listener for: ${chatId}`);
    setIsLoading(true);
    setError(null);

    // Load initial chat history
    chatService.getChatHistory(chatId, 50).then((history) => {
      setMessages(history);
      setIsLoading(false);
    }).catch((err) => {
      console.error('❌ Error loading chat history:', err);
      setError(err.message);
      setIsLoading(false);
    });

    // Listen to new messages
    const unsubscribe = chatService.listenToMessages(
      chatId,
      (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      },
      (updatedMessage) => {
        // Handle message updates (e.g., read status)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    );

    // Cleanup
    return () => {
      console.log(`🔇 Cleaning up chat listener for: ${chatId}`);
      unsubscribe();
    };
  }, [chatId]);

  return {
    messages,
    sendMessage,
    isLoading,
    error
  };
};

/**
 * Hook for getting chat ID between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} Chat ID
 */
export const useChatId = (userId1, userId2) => {
  return chatService.getChatId(userId1, userId2);
};







