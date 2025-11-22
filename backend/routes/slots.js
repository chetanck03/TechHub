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

    const slot = await Slot.create({
      doctorId: doctor._id,
      date,
      startTime,
      endTime
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor's slots
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const slots = await Slot.find({
      doctorId: req.params.doctorId,
      date: { $gte: new Date() },
      isBooked: false
    }).sort({ date: 1, startTime: 1 });

    res.json(slots);
  } catch (error) {
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
