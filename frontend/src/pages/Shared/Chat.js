import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiPaperclip, FiArrowLeft } from 'react-icons/fi';


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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-secondary-600">Loading chat...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        <div className="card mb-4">
          <div className="card-body py-4">
            <div className="flex items-center gap-4">
              <button 
                className="btn btn-ghost btn-sm btn-icon" 
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                {otherUser?.profilePhoto || otherUser?.profileImage ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL}/${otherUser.profilePhoto || otherUser.profileImage}`} 
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-600 border-2 border-primary-200">
                    {otherUser?.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-secondary-900">
                    {user.role === 'patient' ? 'Dr. ' : ''}{otherUser?.name}
                  </h3>
                  <p className="text-sm text-secondary-600">
                    {user.role === 'patient' ? otherUser?.specialization?.name : 'Patient'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-secondary-500">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.senderId === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.senderId === user._id 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-secondary-100 text-secondary-900'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <span className={`text-xs mt-1 block ${
                      msg.senderId === user._id ? 'text-primary-100' : 'text-secondary-500'
                    }`}>
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

          <div className="border-t border-secondary-200 p-4">
            <form className="flex gap-3" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="form-input flex-1"
                disabled={sending}
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-icon"
                disabled={!newMessage.trim() || sending}
              >
                <FiSend className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
