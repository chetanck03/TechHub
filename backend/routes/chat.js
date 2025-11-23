const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Consultation = require('../models/Consultation');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/upload');

// Send message
router.post('/', protect, upload.array('attachments', 5), async (req, res) => {
  try {
    const { consultationId, receiverId, message } = req.body;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation.allowedChat) {
      return res.status(400).json({ message: 'Chat only available after completing the first video consultation' });
    }

    const chatMessage = await ChatMessage.create({
      consultation: consultationId,
      from: req.user._id,
      to: receiverId,
      text: message
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('from', 'name')
      .populate('to', 'name');

    const io = req.app.get('io');
    io.to(consultationId).emit('chat-message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat history
router.get('/:consultationId', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ consultation: req.params.consultationId })
      .populate('from', 'name')
      .populate('to', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await ChatMessage.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if messaging is allowed with a doctor
router.get('/check-access/:doctorId', protect, async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Check if there's a completed consultation with video call between patient and doctor
    const completedConsultation = await Consultation.findOne({
      patientId: req.user._id,
      doctorId: doctorId,
      status: 'completed',
      consultationType: 'video',
      videoCallCompleted: true
    });

    res.json({ 
      canMessage: !!completedConsultation,
      consultationId: completedConsultation?._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
