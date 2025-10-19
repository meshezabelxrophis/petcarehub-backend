import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { prefersReducedMotion } from "../animations/animationConfig";
import { chatWithAI } from "../services/aiService";
import { useAuth } from "../context/AuthContext";

function Chatbot() {
  const { currentUser } = useAuth();

  // User-specific storage keys
  const getUserStorageKey = (key) => {
    const userId = currentUser?.uid || 'anonymous';
    return `chatbot:${userId}:${key}`;
  };

  // Initialize from localStorage to persist across navigation (user-specific)
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserStorageKey("isOpen"));
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(getUserStorageKey("messages"));
      return saved
        ? JSON.parse(saved)
        : [{ role: "assistant", content: "Hi! Ask me anything about your pet care needs. I'm powered by Gemini AI!" }];
    } catch {
      return [{ role: "assistant", content: "Hi! Ask me anything about your pet care needs. I'm powered by Gemini AI!" }];
    }
  });
  const scrollRef = useRef(null);

  // Initialize reduced motion preference
  useEffect(() => {
    setShouldReduceMotion(prefersReducedMotion());
  }, []);

  // Watch for user changes and reset chat
  useEffect(() => {
    const newUserId = currentUser?.uid;
    
    // Reset messages for new user
    const newMessages = [{ role: "assistant", content: "Hi! Ask me anything about your pet care needs. I'm powered by Gemini AI!" }];
    setMessages(newMessages);
    
    // Load user-specific settings
    try {
      const userStorageKey = `chatbot:${newUserId || 'anonymous'}:isOpen`;
      const saved = localStorage.getItem(userStorageKey);
      setIsOpen(saved ? JSON.parse(saved) : false);
    } catch {
      setIsOpen(false);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Persist messages and open state (user-specific)
  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey("messages"), JSON.stringify(messages));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentUser?.uid]);

  useEffect(() => {
    try {
      localStorage.setItem(getUserStorageKey("isOpen"), JSON.stringify(isOpen));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser?.uid]);

  const sendMessage = async (e) => {
    e && e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    
    try {
      // Use new AI service (Gemini via Vercel backend)
      const sessionId = currentUser?.uid ? `user-${currentUser.uid}` : 'anonymous';
      
      const response = await chatWithAI(text, sessionId, {
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        type: 'pet_care_chat'
      });
      
      if (response.success) {
        setMessages((prev) => [...prev, { 
          role: "assistant", 
          content: response.reply 
        }]);
      } else {
        throw new Error(response.error || 'AI response failed');
      }
    } catch (err) {
      const details = typeof err?.message === 'string' ? ` (${err.message})` : '';
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: `There was an error contacting the AI assistant${details}. Please try again.` 
        }
      ]);
      console.error('Chatbot error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full shadow-lg flex items-center gap-2 px-4 py-3 backdrop-blur-sm"
            aria-label="Open Chatbot"
            initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={shouldReduceMotion ? false : { scale: 1, opacity: 1 }}
            exit={{ opacity: 1 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            style={{
              boxShadow: '0 8px 25px rgba(15, 118, 110, 0.3)'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 22c5.523 0 10-3.806 10-8.5S17.523 5 12 5 2 8.806 2 13.5c0 2.1.927 4.03 2.466 5.53C4.177 20.894 3.61 22 3 22c1.5 0 3.432-1.02 4.786-2.05C9.228 20.616 10.585 21 12 21z" />
            </svg>
            <motion.span 
              className="font-medium text-sm hidden sm:inline"
              initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
              animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Chat with AI Assistant
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          className="w-80 sm:w-96 h-96 bg-white rounded-xl shadow-2xl border-2 border-teal-100 flex flex-col overflow-hidden"
          initial={shouldReduceMotion ? false : { 
            scale: 0.9, 
            opacity: 0, 
            y: 20
          }}
          animate={shouldReduceMotion ? false : { 
            scale: 1, 
            opacity: 1, 
            y: 0
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          style={{
            boxShadow: '0 25px 50px rgba(15, 118, 110, 0.15)'
          }}
        >
            {/* Header */}
            <motion.div 
              className="px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-t-xl flex items-center justify-between"
              initial={shouldReduceMotion ? false : { y: -20, opacity: 0 }}
              animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="font-semibold flex items-center gap-2"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-lg">🤖</span>
                PetCare AI (Gemini)
              </motion.div>
              <motion.button 
                onClick={() => setIsOpen(false)} 
                className="text-white/90 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors" 
                aria-label="Close"
                whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={shouldReduceMotion ? false : { opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ✕
              </motion.button>
            </motion.div>

            {/* Messages */}
            <motion.div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-gray-50 to-white"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    className={
                      m.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                    initial={shouldReduceMotion ? false : { 
                      opacity: 0, 
                      y: 10,
                      scale: 0.95
                    }}
                    animate={shouldReduceMotion ? false : { 
                      opacity: 1, 
                      y: 0,
                      scale: 1
                    }}
                    transition={{ 
                      delay: idx * 0.05,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <div
                      className={
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm " +
                        (m.role === "user"
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg"
                          : "bg-white text-gray-800 border-2 border-teal-100 shadow-sm")
                      }
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {loading && (
                <motion.div 
                  className="flex justify-start"
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                >
                  <div className="bg-white text-gray-800 border-2 border-teal-100 rounded-lg px-3 py-2 text-sm shadow-sm">
                    <motion.div 
                      className="flex items-center gap-1"
                      animate={shouldReduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span>AI is thinking</span>
                      <motion.span
                        animate={shouldReduceMotion ? {} : { opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                      >.</motion.span>
                      <motion.span
                        animate={shouldReduceMotion ? {} : { opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                      >.</motion.span>
                      <motion.span
                        animate={shouldReduceMotion ? {} : { opacity: [0, 1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
                      >.</motion.span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Input Form */}
            <motion.form 
              onSubmit={sendMessage} 
              className="p-3 border-t-2 border-teal-100 bg-white rounded-b-xl"
              initial={shouldReduceMotion ? false : { y: 20, opacity: 0 }}
              animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about services, pets, care tips..."
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                />
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  style={{
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)'
                  }}
                >
                  <span>
                    {loading ? "⏳" : "📤"}
                  </span>
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        )}
    </div>
  );
}

export default Chatbot;
