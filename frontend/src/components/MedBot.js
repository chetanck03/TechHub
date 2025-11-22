import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import './MedBot.css';

const MedBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "👋 Hi! I'm MedBot, your AI health assistant. I can help you with:\n\n• General health questions\n• Medication information\n• Platform guidance\n• Booking appointments\n\nHow can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/medbot/suggestions');
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const message = messageText || inputMessage.trim();
    
    if (!message) return;

    // Validate message length
    if (message.length > 1000) {
      const errorMessage = {
        role: 'bot',
        content: "⚠️ Your message is too long. Please keep it under 1000 characters for better responses.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history (last 6 messages for better context)
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      }));

      const response = await api.post('/medbot/chat', {
        message,
        conversationHistory
      });

      // Add bot response
      const botMessage = {
        role: 'bot',
        content: response.data.reply,
        timestamp: new Date(response.data.timestamp)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorContent = "I'm sorry, I encountered an error. Please try again.";
      
      // Handle specific error types
      if (error.response?.status === 429) {
        errorContent = "⏳ I'm currently busy helping other users. Please wait a moment and try again.";
      } else if (error.response?.status === 400) {
        errorContent = error.response.data.message || "⚠️ There was an issue with your message. Please try rephrasing it.";
      } else if (error.response?.data?.message) {
        errorContent = error.response.data.message;
      } else if (!navigator.onLine) {
        errorContent = "🔌 You appear to be offline. Please check your internet connection and try again.";
      }

      const errorMessage = {
        role: 'bot',
        content: errorContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'bot',
        content: "Chat cleared! How can I help you?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`medbot-float-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Chat with MedBot"
      >
        <FiMessageCircle />
        <span className="medbot-badge">AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="medbot-container">
          {/* Header */}
          <div className="medbot-header">
            <div className="medbot-header-info">
              <div className="medbot-avatar">
                <FiMessageCircle />
              </div>
              <div>
                <h3>MedBot</h3>
                <p>AI Health Assistant</p>
              </div>
            </div>
            <div className="medbot-header-actions">
              <button
                className="medbot-icon-btn"
                onClick={handleClearChat}
                title="Clear chat"
              >
                <FiRefreshCw />
              </button>
              <button
                className="medbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="medbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`medbot-message ${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                <div className="medbot-message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="medbot-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="medbot-message bot">
                <div className="medbot-message-content">
                  <div className="medbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && suggestions.length > 0 && (
            <div className="medbot-suggestions">
              <p>Quick questions:</p>
              <div className="medbot-suggestions-grid">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    className="medbot-suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="medbot-input-container">
            <div className="medbot-input-wrapper">
              <textarea
                className="medbot-input"
                placeholder="Ask me anything about health or the platform..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
                disabled={isLoading}
                maxLength={1000}
              />
              {inputMessage.length > 0 && (
                <span className={`medbot-char-count ${inputMessage.length > 900 ? 'warning' : ''}`}>
                  {inputMessage.length}/1000
                </span>
              )}
            </div>
            <button
              className="medbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              title="Send message"
            >
              <FiSend />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="medbot-disclaimer">
            <small>
              ⚠️ MedBot is an AI assistant. For medical emergencies, call emergency services.
              Always consult a doctor for personalized advice.
            </small>
          </div>
        </div>
      )}
    </>
  );
};

export default MedBot;
