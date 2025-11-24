import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, RefreshCw, Clock, Trash2, Bot } from 'lucide-react';
import api from '../utils/api';

const MedBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'history'
  const [sessionId, setSessionId] = useState(null);
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
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await api.get('/medbot/history');
      setChatHistory(response.data.sessions);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadChatSession = async (sessionId) => {
    try {
      const response = await api.get(`/medbot/history/${sessionId}`);
      setMessages(response.data.messages);
      setSessionId(sessionId);
      setCurrentView('chat');
      scrollToBottom();
    } catch (error) {
      console.error('Error loading chat session:', error);
    }
  };

  const deleteChatSession = async (sessionId) => {
    try {
      await api.delete(`/medbot/history/${sessionId}`);
      setChatHistory(prev => prev.filter(session => session.sessionId !== sessionId));
      
      // If current session is deleted, start new chat
      if (sessionId === sessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
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
        conversationHistory,
        sessionId
      });

      // Update session ID if new session was created
      if (response.data.sessionId && !sessionId) {
        setSessionId(response.data.sessionId);
      }

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: 'bot',
        content: "Chat cleared! How can I help you?",
        timestamp: new Date()
      }
    ]);
    setSessionId(null);
    setCurrentView('chat');
  };

  const handleViewHistory = () => {
    setCurrentView('history');
    fetchChatHistory();
  };

  // Function to format markdown text
  const formatMessage = (text) => {
    if (!text) return '';
    
    // Convert markdown formatting to HTML
    let formatted = text
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text: *text* -> <em>text</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code: `text` -> <code>text</code>
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Bullet points: • text -> <li>text</li>
      .replace(/^•\s(.+)$/gm, '<li>$1</li>')
      // Numbered lists: 1. text -> <li>text</li>
      .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> elements in <ul>
      .replace(/(<li>.*<\/li>)/gs, (match) => {
        return '<ul>' + match + '</ul>';
      })
      // Line breaks
      .replace(/\n/g, '<br/>');
    
    return formatted;
  };

  // Component to render formatted message
  const FormattedMessage = ({ content }) => {
    const formattedContent = formatMessage(content);
    return (
      <div 
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white rounded-full shadow-large hover:shadow-xl transition-all duration-300 hover:-translate-y-1 z-40 ${isOpen ? 'hidden' : 'flex'} items-center justify-center group`}
        onClick={() => setIsOpen(true)}
        title="Chat with MedBot AI Assistant"
      >
        <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
          AI
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-large border border-secondary-200 flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-gradient-to-r from-success-50 to-success-100 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-secondary-900">MedBot</h3>
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">AI</span>
                </div>
                <p className="text-xs text-secondary-600">AI Health Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {currentView === 'chat' ? (
                <>
                  <button
                    className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                    onClick={handleViewHistory}
                    title="View chat history"
                  >
                    <Clock className="w-4 h-4 text-secondary-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                    onClick={handleNewChat}
                    title="New chat"
                  >
                    <RefreshCw className="w-4 h-4 text-secondary-600" />
                  </button>
                </>
              ) : (
                <button
                  className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                  onClick={() => setCurrentView('chat')}
                  title="Back to chat"
                >
                  <MessageCircle className="w-4 h-4 text-secondary-600" />
                </button>
              )}
              <button
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="w-4 h-4 text-secondary-600" />
              </button>
            </div>
          </div>

          {/* Messages or History */}
          {currentView === 'chat' ? (
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100 p-4 space-y-4 pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-900'} rounded-2xl px-4 py-3`}>
                    <div className="text-sm">
                      <FormattedMessage content={msg.content} />
                    </div>
                    <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-100' : 'text-secondary-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100 p-4">
              <div className="mb-6">
                <h4 className="font-semibold text-secondary-900 mb-1">Chat History</h4>
                <p className="text-sm text-secondary-600">Your previous conversations with MedBot</p>
              </div>
              
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-1 mb-4">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-secondary-600">Loading chat history...</p>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageCircle className="w-12 h-12 text-secondary-300 mb-4" />
                  <p className="text-secondary-600 mb-2">No chat history yet</p>
                  <small className="text-secondary-500">Start a conversation to see your history here</small>
                </div>
              ) : (
                <div className="space-y-3 pr-2">
                  {chatHistory.map((session) => (
                    <div key={session.sessionId} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => loadChatSession(session.sessionId)}
                      >
                        <div className="text-sm text-secondary-900 mb-1">
                          {session.messages.length > 0 && session.messages[1] ? 
                            session.messages[1].content.substring(0, 60) + '...' : 
                            'New conversation'
                          }
                        </div>
                        <div className="flex items-center gap-3 text-xs text-secondary-500">
                          <span>{new Date(session.lastActivity).toLocaleDateString()}</span>
                          <span>{Math.floor(session.messages.length / 2)} messages</span>
                        </div>
                      </div>
                      <button
                        className="p-2 hover:bg-danger-100 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatSession(session.sessionId);
                        }}
                        title="Delete conversation"
                      >
                        <Trash2 className="w-4 h-4 text-danger-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Suggestions - only show in chat view */}
          {currentView === 'chat' && messages.length <= 2 && suggestions.length > 0 && (
            <div className="px-4 pb-2">
              <p className="text-sm text-secondary-600 mb-3">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-xs p-2 bg-secondary-50 hover:bg-primary-50 text-secondary-700 hover:text-primary-700 rounded-lg transition-colors text-left"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input - only show in chat view */}
          {currentView === 'chat' && (
            <div className="p-4 border-t border-secondary-200 bg-white rounded-b-2xl">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full p-3 pr-16 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 text-sm"
                    placeholder="Ask me anything about health..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    maxLength={1000}
                  />
                  {inputMessage.length > 0 && (
                    <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${inputMessage.length > 900 ? 'text-warning-500' : 'text-secondary-400'}`}>
                      {inputMessage.length}/1000
                    </span>
                  )}
                </div>
                <button
                  className="flex-shrink-0 p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-300 text-white rounded-xl transition-colors"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {currentView === 'chat' && (
            <div className="px-4 pb-4">
              <div className="text-xs text-secondary-500 bg-warning-50 border border-warning-200 rounded-lg p-3">
                ⚠️ MedBot is an AI assistant. For medical emergencies, call emergency services.
                Always consult a doctor for personalized advice.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MedBot;
