import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { 
  FiVideo, FiVideoOff, FiMic, FiMicOff, FiPhone, 
  FiMessageSquare, FiFileText, FiX, FiSend 
} from 'react-icons/fi';
import './VideoCall.css';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const VideoCallNew = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  // State
  const [consultation, setConsultation] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Media controls
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Notes
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  
  // Chat
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatAllowed, setChatAllowed] = useState(false);

  // Initialize consultation and socket
  useEffect(() => {
    initializeCall();
    return () => cleanup();
  }, [consultationId]);

  const initializeCall = async () => {
    try {
      // Get current user
      const userRes = await api.get('/users/profile');
      setCurrentUserId(userRes.data._id);

      // Get consultation details
      const consultationRes = await api.get(`/consultations/${consultationId}`);
      setConsultation(consultationRes.data);
      setChatAllowed(consultationRes.data.allowedChat);

      // Start consultation and get room ID
      const startRes = await api.post(`/consultations/${consultationId}/start`);
      setRoomId(startRes.data.roomId);

      // Initialize socket connection
      const token = localStorage.getItem('token');
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      socketRef.current = socket;

      // Socket event listeners
      socket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnected(true);
        socket.emit('join-room', { 
          consultationId, 
          roomId: startRes.data.roomId 
        });
      });

      socket.on('joined-room', async (data) => {
        console.log('✅ Joined room:', data);
        await initializeMedia();
        await loadNotes();
        if (chatAllowed) {
          await loadMessages();
        }
      });

      socket.on('user-joined', (data) => {
        console.log('👤 User joined:', data);
        toast.info(`${data.name} joined the call`);
        setRemoteConnected(true);
        // Create offer if we're the first one
        if (peerConnectionRef.current) {
          createOffer();
        }
      });

      socket.on('user-left', (data) => {
        console.log('👤 User left:', data);
        toast.info(`${data.name} left the call`);
        setRemoteConnected(false);
      });

      socket.on('signal-offer', handleReceiveOffer);
      socket.on('signal-answer', handleReceiveAnswer);
      socket.on('signal-ice', handleReceiveIceCandidate);
      socket.on('note-added', handleNoteAdded);
      socket.on('notes-loaded', (loadedNotes) => setNotes(loadedNotes));
      socket.on('chat-message', handleChatMessage);
      socket.on('call-ended', handleCallEnded);
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error(error.message || 'Socket connection error');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Failed to connect to server');
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          socket.connect();
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize call');
      setLoading(false);
      // Navigate back if initialization fails
      setTimeout(() => navigate('/consultations'), 3000);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      createPeerConnection(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  const createPeerConnection = (stream) => {
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = peerConnection;

    // Add local stream tracks to peer connection
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log('📥 Received remote track');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal-ice', {
          roomId,
          candidate: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setRemoteConnected(true);
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        setRemoteConnected(false);
      }
    };
  };

  const createOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      socketRef.current.emit('signal-offer', {
        roomId,
        offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleReceiveOffer = async ({ offer, from, fromName }) => {
    try {
      console.log('📥 Received offer from:', fromName);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      socketRef.current.emit('signal-answer', {
        roomId,
        answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleReceiveAnswer = async ({ answer, from, fromName }) => {
    try {
      console.log('📥 Received answer from:', fromName);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleReceiveIceCandidate = async ({ candidate, from }) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  // Media controls
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  const endCall = async () => {
    try {
      await api.post(`/consultations/${consultationId}/end`);
      socketRef.current.emit('call-ended', { consultationId, roomId });
      cleanup();
      toast.success('Call ended successfully');
      navigate('/consultations');
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call');
    }
  };

  const cleanup = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const handleCallEnded = () => {
    toast.info('Call has ended');
    cleanup();
    navigate('/consultations');
  };

  // Notes functions
  const loadNotes = async () => {
    try {
      const response = await api.get(`/consultations/${consultationId}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('add-note', {
      consultationId,
      text: noteText
    });

    setNoteText('');
  };

  const handleNoteAdded = (note) => {
    setNotes(prev => [...prev, note]);
  };

  // Chat functions
  const loadMessages = async () => {
    try {
      const response = await api.get(`/consultations/${consultationId}/chat`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    if (!socketRef.current || !socketRef.current.connected) {
      toast.error('Not connected to server');
      return;
    }

    socketRef.current.emit('chat-message', {
      consultationId,
      text: messageText
    });

    setMessageText('');
  };

  const handleChatMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  if (loading) {
    return (
      <div className="video-call-container">
        <div className="loading">Loading consultation...</div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Video Grid */}
      <div className="video-grid">
        {/* Remote Video (Large) */}
        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          {!remoteConnected && (
            <div className="waiting-overlay">
              <div className="waiting-message">
                <div className="spinner"></div>
                <p>Waiting for other participant...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Small, Picture-in-Picture) */}
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          {!videoEnabled && (
            <div className="video-off-overlay">
              <FiVideoOff size={32} />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="video-controls">
        <button
          onClick={toggleVideo}
          className={`control-btn ${!videoEnabled ? 'disabled' : ''}`}
          title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {videoEnabled ? <FiVideo size={24} /> : <FiVideoOff size={24} />}
        </button>

        <button
          onClick={toggleAudio}
          className={`control-btn ${!audioEnabled ? 'disabled' : ''}`}
          title={audioEnabled ? 'Mute' : 'Unmute'}
        >
          {audioEnabled ? <FiMic size={24} /> : <FiMicOff size={24} />}
        </button>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`control-btn ${showNotes ? 'active' : ''}`}
          title="Notes"
        >
          <FiFileText size={24} />
        </button>

        {chatAllowed && (
          <button
            onClick={() => setShowChat(!showChat)}
            className={`control-btn ${showChat ? 'active' : ''}`}
            title="Chat"
          >
            <FiMessageSquare size={24} />
          </button>
        )}

        <button
          onClick={endCall}
          className="control-btn end-call"
          title="End call"
        >
          <FiPhone size={24} />
        </button>
      </div>

      {/* Notes Panel */}
      {showNotes && (
        <div className="side-panel notes-panel">
          <div className="panel-header">
            <h3><FiFileText /> Notes</h3>
            <button onClick={() => setShowNotes(false)} className="close-btn">
              <FiX />
            </button>
          </div>
          <div className="panel-content">
            <div className="notes-list">
              {notes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-header">
                    <span className="note-author">{note.authorId?.name}</span>
                    <span className="note-time">
                      {new Date(note.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="note-text">{note.text}</div>
                </div>
              ))}
            </div>
            <div className="note-input">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                rows="3"
              />
              <button onClick={addNote} className="btn-primary">
                <FiSend /> Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      {showChat && chatAllowed && (
        <div className="side-panel chat-panel">
          <div className="panel-header">
            <h3><FiMessageSquare /> Chat</h3>
            <button onClick={() => setShowChat(false)} className="close-btn">
              <FiX />
            </button>
          </div>
          <div className="panel-content">
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-item ${
                    msg.from._id === currentUserId ? 'sent' : 'received'
                  }`}
                >
                  <div className="message-header">
                    <span className="message-author">{msg.from.name}</span>
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-text">{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
              />
              <button onClick={sendMessage} className="btn-primary">
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallNew;
