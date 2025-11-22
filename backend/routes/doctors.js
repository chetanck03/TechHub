const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/upload');

// Register as doctor (Initial Registration - Requires Approval)
router.post('/register', protect, upload.fields([
  { name: 'degreeDocument', maxCount: 1 },
  { name: 'licenseDocument', maxCount: 1 },
  { name: 'idProof', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📝 Doctor registration request received');
    console.log('User ID:', req.user._id);
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Body keys:', Object.keys(req.body));

    // Check if user already registered as doctor
    const existingDoctor = await Doctor.findOne({ userId: req.user._id });
    if (existingDoctor) {
      console.log('❌ User already has doctor profile');
      return res.status(400).json({ message: 'You have already registered as a doctor' });
    }

    const {
      phone,
      gender,
      dateOfBirth,
      qualification,
      specialization,
      experience,
      medicalRegistrationNumber,
      issuingMedicalCouncil,
      currentHospitalClinic,
      currentWorkingCity,
      languagesSpoken
    } = req.body;

    // Validate required fields
    if (!phone || !gender || !dateOfBirth || !qualification || !specialization || !experience) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Validate required documents
    if (!req.files || !req.files.degreeDocument || !req.files.licenseDocument || !req.files.idProof) {
      console.log('❌ Missing required documents');
      return res.status(400).json({ message: 'All documents (Degree, License, ID Proof) are required' });
    }

    console.log('✅ Creating doctor profile...');

    const doctor = await Doctor.create({
      userId: req.user._id,
      phone,
      gender,
      dateOfBirth,
      qualification,
      specialization,
      experience: parseInt(experience),
      medicalRegistrationNumber,
      issuingMedicalCouncil,
      currentHospitalClinic,
      currentWorkingCity,
      languagesSpoken: JSON.parse(languagesSpoken || '[]'),
      profilePhoto: req.files.profilePhoto?.[0]?.path,
      degreeDocument: req.files.degreeDocument[0].path,
      licenseDocument: req.files.licenseDocument[0].path,
      idProof: req.files.idProof[0].path,
      status: 'pending',
      isApproved: false
    });

    console.log('✅ Doctor profile created:', doctor._id);

    // Update user role to doctor (but not approved yet)
    await User.findByIdAndUpdate(req.user._id, { role: 'doctor' });
    console.log('✅ User role updated to doctor');

    res.status(201).json({
      message: 'Doctor registration submitted successfully. Please wait for admin approval before you can login.',
      doctor: {
        _id: doctor._id,
        status: doctor.status
      }
    });
  } catch (error) {
    console.error('❌ Doctor registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Medical registration number already exists' });
    }
    res.status(500).json({ message: error.message, details: error.toString() });
  }
});

// Get all approved doctors (PUBLIC - For Patients)
router.get('/', async (req, res) => {
  try {
    const { specialization, minExperience, maxFee, minRating, city, search } = req.query;

    let query = { 
      status: 'approved',
      isApproved: true,
      suspended: { $ne: true }
    };

    if (specialization) query.specialization = specialization;
    if (minExperience) query.experience = { $gte: parseInt(minExperience) };
    if (maxFee) query['consultationFee.video'] = { $lte: parseInt(maxFee) };
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (city) query.currentWorkingCity = new RegExp(city, 'i');

    const doctors = await Doctor.find(query)
      .populate('userId', 'name')
      .populate('specialization', 'name')
      .select('-phone -gender -dateOfBirth -medicalRegistrationNumber -issuingMedicalCouncil -degreeDocument -licenseDocument -idProof -platformFeePaid -registrationFee')
      .sort({ rating: -1 });

    // Return only public profile data
    const publicDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.userId?.name,
      profilePhoto: doctor.profilePhoto,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      languagesSpoken: doctor.languagesSpoken,
      currentHospitalClinic: doctor.currentHospitalClinic,
      currentWorkingCity: doctor.currentWorkingCity,
      rating: doctor.rating,
      totalRatings: doctor.totalRatings,
      consultationFee: doctor.consultationFee,
      consultationModes: doctor.consultationModes,
      availableDays: doctor.availableDays,
      about: doctor.about,
      isAvailable: doctor.isAvailable
    }));

    res.json(publicDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor by ID (PUBLIC - For Patients)
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name')
      .populate('specialization', 'name')
      .select('-phone -gender -dateOfBirth -medicalRegistrationNumber -issuingMedicalCouncil -degreeDocument -licenseDocument -idProof -platformFeePaid -registrationFee');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.status !== 'approved' || !doctor.isApproved || doctor.suspended) {
      return res.status(404).json({ message: 'Doctor not available' });
    }

    // Return only public profile
    const publicProfile = {
      _id: doctor._id,
      name: doctor.userId?.name,
      profilePhoto: doctor.profilePhoto,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.experience,
      languagesSpoken: doctor.languagesSpoken,
      currentHospitalClinic: doctor.currentHospitalClinic,
      currentWorkingCity: doctor.currentWorkingCity,
      rating: doctor.rating,
      totalRatings: doctor.totalRatings,
      consultationFee: doctor.consultationFee,
      consultationModes: doctor.consultationModes,
      availableDays: doctor.availableDays,
      about: doctor.about,
      isAvailable: doctor.isAvailable
    };

    res.json(publicProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if doctor profile exists (PROTECTED - For Doctor)
router.get('/my-profile', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate('specialization', 'name');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get doctor's own profile (PROTECTED - For Doctor)
router.get('/me/profile', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('userId', 'name email')
      .populate('specialization', 'name');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update consultation details (PROTECTED - Only for Approved Doctors)
router.put('/me/consultation-details', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (!doctor.isApproved || doctor.status !== 'approved') {
      return res.status(403).json({ message: 'Your profile is not approved yet. Please wait for admin approval.' });
    }

    const {
      consultationModes,
      consultationFee,
      about,
      availableDays,
      maxPatientsPerDay,
      followUpPolicy,
      isAvailable
    } = req.body;

    // Only allow updating consultation-related fields
    if (consultationModes) doctor.consultationModes = consultationModes;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (about !== undefined) doctor.about = about;
    if (availableDays) doctor.availableDays = availableDays;
    if (maxPatientsPerDay) doctor.maxPatientsPerDay = maxPatientsPerDay;
    if (followUpPolicy !== undefined) doctor.followUpPolicy = followUpPolicy;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;

    await doctor.save();

    res.json({
      message: 'Consultation details updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile photo (PROTECTED - For Approved Doctors)
router.put('/me/profile-photo', protect, authorize('doctor'), upload.single('profilePhoto'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (!doctor.isApproved) {
      return res.status(403).json({ message: 'Your profile is not approved yet' });
    }

    if (req.file) {
      doctor.profilePhoto = req.file.path;
      await doctor.save();
    }

    res.json({
      message: 'Profile photo updated successfully',
      profilePhoto: doctor.profilePhoto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
