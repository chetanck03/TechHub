const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Transaction = require('../models/Transaction');
const Consultation = require('../models/Consultation');
const { protect, authorize } = require('../middleware/auth');
const { sendDoctorApproval } = require('../utils/email');

// Dashboard stats
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments({ status: 'approved' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalBookings = await Consultation.countDocuments();
    const pendingApprovals = await Doctor.countDocuments({ status: 'pending' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAppointments = await Consultation.countDocuments({
      date: { $gte: today }
    });

    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    
    const activeDoctors = await Doctor.countDocuments({ 
      status: 'approved',
      suspended: { $ne: true }
    });

    const refundRequests = await Consultation.countDocuments({
      status: 'cancelled',
      refunded: { $ne: true }
    });

    const revenue = await Transaction.aggregate([
      { $match: { type: 'credit_purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentTransactions = await Transaction.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalDoctors,
      totalPatients,
      totalBookings,
      todayAppointments,
      pendingApprovals,
      pendingComplaints,
      activeDoctors,
      refundRequests,
      revenue: revenue[0]?.total || 0,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics data for charts
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const consultationsData = await Promise.all(
      last7Days.map(async (date) => {
        const count = await Consultation.countDocuments({
          createdAt: {
            $gte: new Date(date),
            $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
          }
        });
        return count;
      })
    );

    const creditsData = await Promise.all(
      last7Days.map(async (date) => {
        const result = await Transaction.aggregate([
          {
            $match: {
              type: 'credit_purchase',
              createdAt: {
                $gte: new Date(date),
                $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        return result[0]?.total || 0;
      })
    );

    const usersData = await Promise.all(
      last7Days.map(async (date) => {
        const count = await User.countDocuments({
          createdAt: {
            $gte: new Date(date),
            $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
          }
        });
        return count;
      })
    );

    res.json({
      consultations: {
        labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        data: consultationsData
      },
      credits: {
        labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        data: creditsData
      },
      users: {
        labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        data: usersData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending doctor approvals
router.get('/doctors/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .populate('specialization', 'name');

    // Include file information for each doctor
    const { getFileInfo } = require('../utils/fileStorage');
    
    const doctorsWithFiles = doctors.map(doctor => {
      const fileInfo = {
        profilePhoto: getFileInfo(doctor.profilePhoto),
        degreeDocument: getFileInfo(doctor.degreeDocument),
        licenseDocument: getFileInfo(doctor.licenseDocument),
        idProof: getFileInfo(doctor.idProof)
      };

      return {
        ...doctor.toObject(),
        fileInfo
      };
    });

    res.json(doctorsWithFiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject doctor
router.put('/doctors/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const doctor = await Doctor.findById(req.params.id).populate('userId');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.status = status;
    
    if (status === 'approved') {
      doctor.isApproved = true;
      doctor.approvedAt = new Date();
      doctor.rejectionReason = undefined;
    } else if (status === 'rejected') {
      doctor.isApproved = false;
      doctor.rejectionReason = rejectionReason || 'Not specified';
    }
    
    await doctor.save();

    // Send email notification
    await sendDoctorApproval(doctor.userId.email, doctor.userId.name, status, rejectionReason);

    res.json({
      message: `Doctor ${status} successfully. Email notification sent.`,
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all complaints
router.get('/complaints', protect, authorize('admin'), async (req, res) => {
  try {
    const { type } = req.query;

    let query = {};
    if (type === 'doctor') {
      const doctors = await Doctor.find().select('userId');
      const doctorUserIds = doctors.map(d => d.userId);
      query.complainantId = { $in: doctorUserIds };
    } else if (type === 'patient') {
      query.complainantId = { $nin: await Doctor.find().distinct('userId') };
    }

    const complaints = await Complaint.find(query)
      .populate('complainantId', 'name email role')
      .populate('againstId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update complaint status
router.put('/complaints/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    complaint.status = status;
    complaint.adminResponse = adminResponse;
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }
    await complaint.save();

    res.json({ message: 'Complaint updated', complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all transactions
router.get('/transactions', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let query = {};
    if (type) query.type = type;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Patient Management
router.get('/patients', protect, authorize('admin'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        const consultationCount = await Consultation.countDocuments({ patientId: patient._id });
        return {
          ...patient.toObject(),
          consultationCount
        };
      })
    );

    res.json(patientsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/patients/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');
    const consultations = await Consultation.find({ patientId: req.params.id })
      .populate('doctorId')
      .sort({ createdAt: -1 });
    const complaints = await Complaint.find({ complainantId: req.params.id });

    res.json({
      ...patient.toObject(),
      consultations,
      complaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/patients/:id/block', protect, authorize('admin'), async (req, res) => {
  try {
    const { blocked } = req.body;
    const patient = await User.findByIdAndUpdate(
      req.params.id,
      { blocked },
      { new: true }
    ).select('-password');

    res.json({ message: `Patient ${blocked ? 'blocked' : 'unblocked'} successfully`, patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Doctor Management
router.get('/doctors', protect, authorize('admin'), async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phone credits')
      .populate('specialization', 'name');

    const doctorsWithStats = await Promise.all(
      doctors.map(async (doctor) => {
        const consultationCount = await Consultation.countDocuments({ doctorId: doctor._id });
        return {
          ...doctor.toObject(),
          consultationCount
        };
      })
    );

    res.json(doctorsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/doctors/:id/details', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone credits')
      .populate('specialization', 'name');
    
    const consultations = await Consultation.find({ doctorId: req.params.id })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const complaints = await Complaint.find({ againstId: doctor.userId });

    const totalEarnings = await Transaction.aggregate([
      { 
        $match: { 
          userId: doctor.userId._id,
          type: 'consultation',
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Include file information for admin
    const { getFileInfo } = require('../utils/fileStorage');
    const fileInfo = {
      profilePhoto: getFileInfo(doctor.profilePhoto),
      degreeDocument: getFileInfo(doctor.degreeDocument),
      licenseDocument: getFileInfo(doctor.licenseDocument),
      idProof: getFileInfo(doctor.idProof)
    };

    res.json({
      ...doctor.toObject(),
      consultations,
      complaints,
      totalEarnings: totalEarnings[0]?.total || 0,
      fileInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/doctors/:id/suspend', protect, authorize('admin'), async (req, res) => {
  try {
    const { suspended } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { suspended },
      { new: true }
    ).populate('userId', 'name email');

    res.json({ message: `Doctor ${suspended ? 'suspended' : 'activated'} successfully`, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Appointments Management
router.get('/appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = {};
    
    if (status && status !== 'all') query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Consultation.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId')
      .populate('slotId')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/appointments/:id/refund', protect, authorize('admin'), async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');

    if (!consultation) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (consultation.status !== 'cancelled') {
      return res.status(400).json({ message: 'Only cancelled appointments can be refunded' });
    }

    if (consultation.refunded) {
      return res.status(400).json({ message: 'Refund already processed' });
    }

    const patient = await User.findById(consultation.patientId);
    patient.credits += consultation.consultationFee;
    await patient.save();

    consultation.refunded = true;
    await consultation.save();

    await Transaction.create({
      userId: patient._id,
      type: 'refund',
      amount: consultation.consultationFee,
      description: `Refund for cancelled consultation`,
      status: 'completed'
    });

    res.json({ message: 'Refund processed successfully', consultation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Transaction Management
router.get('/transactions/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalRevenue = await Transaction.aggregate([
      { $match: { type: 'credit_purchase', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const patientCredits = await Transaction.aggregate([
      { 
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { 
        $match: { 
          'user.role': 'patient',
          type: 'credit_purchase',
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const doctorCredits = await Transaction.aggregate([
      { 
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { 
        $match: { 
          'user.role': 'doctor',
          type: 'credit_purchase',
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const platformFee = await Transaction.aggregate([
      { $match: { type: 'platform_fee', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      patientCredits: patientCredits[0]?.total || 0,
      doctorCredits: doctorCredits[0]?.total || 0,
      platformFee: platformFee[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/transactions/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, userType, startDate, endDate } = req.query;
    let query = {};
    
    if (type && type !== 'all') query.type = type;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    let csv = 'Date,Transaction ID,User,Role,Type,Description,Amount,Status\n';
    transactions.forEach(t => {
      csv += `${new Date(t.createdAt).toLocaleString()},${t._id},${t.userId?.name},${t.userId?.role},${t.type},${t.description},${t.amount},${t.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Settings Management
router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    // In a real app, store these in a Settings model
    res.json({
      creditPricing: 10,
      consultationLimit: 5,
      platformFeePercentage: 10,
      refundPolicy: 'Refunds are processed within 7 business days for cancelled consultations.',
      termsAndConditions: 'By using this platform, you agree to our terms and conditions.',
      notificationMessage: 'Welcome to our telehealth platform!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    // In a real app, update Settings model
    res.json({ message: 'Settings updated successfully', settings: req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View doctor documents (Admin only)
router.get('/doctors/:id/document/:type', protect, authorize('admin'), async (req, res) => {
  try {
    console.log(`📄 Admin requesting document: ${req.params.type} for doctor: ${req.params.id}`);
    
    const { id, type } = req.params;
    const validTypes = ['profilePhoto', 'degreeDocument', 'licenseDocument', 'idProof'];
    
    if (!validTypes.includes(type)) {
      console.log(`❌ Invalid document type: ${type}`);
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const doctor = await Doctor.findById(id).select(type);
    
    if (!doctor) {
      console.log(`❌ Doctor not found: ${id}`);
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    if (!doctor[type]) {
      console.log(`❌ Document field not found: ${type}`);
      return res.status(404).json({ message: 'Document field not found' });
    }
    
    if (!doctor[type].data) {
      console.log(`❌ Document data not found for: ${type}`);
      return res.status(404).json({ message: 'Document data not found' });
    }

    console.log(`✅ Serving document: ${type}, size: ${doctor[type].data.length} chars, contentType: ${doctor[type].contentType}`);

    const documentBuffer = Buffer.from(doctor[type].data, 'base64');
    
    res.set({
      'Content-Type': doctor[type].contentType,
      'Content-Length': documentBuffer.length,
      'Content-Disposition': `inline; filename="${doctor[type].originalName}"`,
      'Cache-Control': 'private, no-cache'
    });
    
    res.send(documentBuffer);
  } catch (error) {
    console.error('❌ Error serving document:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all doctor documents info (Admin only)
router.get('/doctors/:id/documents', protect, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('profilePhoto degreeDocument licenseDocument idProof')
      .populate('userId', 'name email');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const { getFileInfo } = require('../utils/fileStorage');

    // Debug information
    console.log('📋 Document debug info for doctor:', req.params.id);
    console.log('- Profile Photo data length:', doctor.profilePhoto?.data?.length || 'No data');
    console.log('- Degree Document data length:', doctor.degreeDocument?.data?.length || 'No data');
    console.log('- License Document data length:', doctor.licenseDocument?.data?.length || 'No data');
    console.log('- ID Proof data length:', doctor.idProof?.data?.length || 'No data');

    res.json({
      doctorInfo: {
        name: doctor.userId?.name,
        email: doctor.userId?.email
      },
      documents: {
        profilePhoto: getFileInfo(doctor.profilePhoto),
        degreeDocument: getFileInfo(doctor.degreeDocument),
        licenseDocument: getFileInfo(doctor.licenseDocument),
        idProof: getFileInfo(doctor.idProof)
      },
      debug: {
        profilePhotoDataLength: doctor.profilePhoto?.data?.length || 0,
        degreeDocumentDataLength: doctor.degreeDocument?.data?.length || 0,
        licenseDocumentDataLength: doctor.licenseDocument?.data?.length || 0,
        idProofDataLength: doctor.idProof?.data?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
