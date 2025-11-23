const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// Create slots (Doctor only)
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    // Validate time slots
    if (startTime >= endTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    console.log('Creating slot for doctor:', doctor._id, 'User:', req.user._id);

    const slot = await Slot.create({
      doctorId: doctor._id,
      date,
      startTime,
      endTime
    });

    console.log('Slot created:', slot);
    res.status(201).json(slot);
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get doctor's slots
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    console.log('Fetching slots for doctorId:', req.params.doctorId);
    
    // First check if we're getting the doctor's profile ID or user ID
    let doctorId = req.params.doctorId;
    
    // If the doctorId looks like a user ID, find the doctor profile
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      // Try to find by userId instead
      const doctorByUserId = await Doctor.findOne({ userId: doctorId });
      if (doctorByUserId) {
        doctorId = doctorByUserId._id;
        console.log('Found doctor by userId, using doctorId:', doctorId);
      }
    }
    
    // First, let's see all slots for this doctor (for debugging)
    const allSlots = await Slot.find({ doctorId: doctorId });
    console.log('All slots for doctor:', allSlots.length, allSlots);
    
    // Get today's date at midnight for proper comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const slots = await Slot.find({
      doctorId: doctorId,
      date: { $gte: today }, // Include today's slots and future
      isBooked: false
    }).sort({ date: 1, startTime: 1 });

    console.log('Filtered available slots:', slots.length, slots);
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get my slots (Doctor)
router.get('/my-slots', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const slots = await Slot.find({ doctorId: doctor._id })
      .sort({ date: 1, startTime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete slot
router.delete('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    
    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete booked slot' });
    }

    await slot.deleteOne();
    res.json({ message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
