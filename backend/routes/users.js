const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, age, gender, phone, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, age, gender, phone, location },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get credits balance
router.get('/credits', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('credits');
    res.json({ credits: user.credits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
