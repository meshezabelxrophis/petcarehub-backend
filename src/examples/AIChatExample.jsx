/**
 * Example: AI Chat with Gemini
 * 
 * This component demonstrates how to:
 * 1. Send messages to Gemini AI via Vercel backend
 * 2. Display responses in a chat interface
 * 3. Automatically store conversations in Firestore
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatWithAI } from '../services/aiService';

export default function AIChatExample() {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`chat_${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    setLoading(true);

    try {
      // Send to AI via Vercel backend
      const response = await chatWithAI(userMessage, sessionId, {
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        type: 'pet_care_chat'
      });

      // Add AI response to UI
      if (response.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(response.error || 'AI response failed');
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      // Show error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    'What are the best foods for a golden retriever?',
    'How often should I groom my dog?',
    'What vaccinations does my puppy need?',
    'Signs of a healthy cat?'
  ];

  return (
    <div style={{
      maxWidth: '800px',
      margin: '50px auto',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: '#0070f3',
        color: 'white',
        borderBottom: '1px solid #ccc'
      }}>
        <h2 style={{ margin: 0 }}>AI Pet Care Assistant</h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
          Powered by Gemini AI via Vercel Backend
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Ask me anything about pet care!
            </p>
            
            <div style={{ marginTop: '30px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                Suggested questions:
              </p>
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '500px',
                    margin: '10px auto',
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px'
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: message.role === 'user' ? '#0070f3' : 'white',
                color: message.role === 'user' ? 'white' : '#333',
                border: message.error ? '1px solid red' : 'none'
              }}
            >
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {message.content}
              </p>
              <span style={{
                fontSize: '11px',
                opacity: 0.7,
                marginTop: '5px',
                display: 'block'
              }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: '#666'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #0070f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ marginLeft: '10px' }}>AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          padding: '20px',
          borderTop: '1px solid #ccc',
          backgroundColor: 'white'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about pet care..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginRight: '10px',
            fontSize: '14px'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || !input.trim() ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Send
        </button>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

