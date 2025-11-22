import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiPaperclip, FiArrowLeft } from 'react-icons/fi';
import './Chat.css';

const Chat = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchConsultation();
    fetchMessages();
    
    // Connect to socket
    const socket = window.io(`${process.env.REACT_APP_API_URL}`, {
      auth: { token: localStorage.getItem('token') }
    });
    
    socketRef.current = socket;
    
    socket.emit('join-consultation', consultationId);
    
    socket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.emit('leave-consultation', consultationId);
      socket.disconnect();
    };
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const response = await api.get(`/consultations/${consultationId}`);
      setConsultation(response.data);
      
      // Determine other user
      const isPatient = user.role === 'patient';
      const otherUserId = isPatient ? response.data.doctorId : response.data.patientId;
      
      // Fetch other user details
      const userResponse = await api.get(isPatient 
        ? `/doctors/${otherUserId}` 
        : `/users/${otherUserId}`
      );
      setOtherUser(userResponse.data);
    } catch (error) {
      console.error('Error fetching consultation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${consultationId}`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const receiverId = user.role === 'patient' 
        ? consultation.doctorId 
        : consultation.patientId;

      await api.post('/chat', {
        consultationId,
        receiverId,
        message: newMessage
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading chat...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="chat-container">
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft />
          </button>
          <div className="chat-user-info">
            {otherUser?.profilePhoto || otherUser?.profileImage ? (
              <img 
                src={`${process.env.REACT_APP_API_URL}/${otherUser.profilePhoto || otherUser.profileImage}`} 
                alt={otherUser.name}
                className="chat-avatar"
              />
            ) : (
              <div className="chat-avatar">
                {otherUser?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h3>{user.role === 'patient' ? 'Dr. ' : ''}{otherUser?.name}</h3>
              <p className="chat-subtitle">
                {user.role === 'patient' ? otherUser?.specialization?.name : 'Patient'}
              </p>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.senderId === user._id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{msg.message}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            disabled={sending}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={!newMessage.trim() || sending}
          >
            <FiSend />
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Chat;
