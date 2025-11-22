import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Doctor.css';

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    consultationModes: {
      video: true,
      physical: false
    },
    consultationFee: {
      video: 10,
      physical: 15
    },
    about: '',
    availableDays: [],
    maxPatientsPerDay: 10,
    followUpPolicy: '',
    isAvailable: true
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await api.get('/doctors/me/profile');
      setDoctor(response.data);
      setFormData({
        consultationModes: response.data.consultationModes || { video: true, physical: false },
        consultationFee: response.data.consultationFee || { video: 10, physical: 15 },
        about: response.data.about || '',
        availableDays: response.data.availableDays || [],
        maxPatientsPerDay: response.data.maxPatientsPerDay || 10,
        followUpPolicy: response.data.followUpPolicy || '',
        isAvailable: response.data.isAvailable !== undefined ? response.data.isAvailable : true
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    const days = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    setFormData({ ...formData, availableDays: days });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.put('/doctors/me/consultation-details', formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchDoctorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    
    if (!profilePhoto) {
      toast.error('Please select a photo');
      return;
    }

    const data = new FormData();
    data.append('profilePhoto', profilePhoto);

    try {
      await api.put('/doctors/me/profile-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile photo updated successfully');
      setProfilePhoto(null);
      fetchDoctorProfile();
    } catch (error) {
      toast.error('Failed to update profile photo');
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  if (!doctor) return <Layout><div className="loading">Profile not found</div></Layout>;

  if (!doctor.isApproved) {
    return (
      <Layout>
        <div className="dashboard">
          <div className="info-box">
            <h2>⏳ Profile Pending Approval</h2>
            <p>Your doctor profile is currently under review by our admin team.</p>
            <p>You will receive an email notification once your profile is approved.</p>
            <p><strong>Status:</strong> {doctor.status}</p>
            {doctor.rejectionReason && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px' }}>
                <strong>Rejection Reason:</strong>
                <p>{doctor.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard">
        <div className="profile-header-section">
          <h1>My Profile</h1>
          {!editing && (
            <button className="btn-primary" onClick={() => setEditing(true)}>
              Edit Consultation Details
            </button>
          )}
        </div>

        {/* Profile Photo Section */}
        <div className="profile-section">
          <h2>Profile Photo</h2>
          <div className="photo-upload-section">
            {doctor.profilePhoto ? (
              <img 
                src={`${process.env.REACT_APP_API_URL}/${doctor.profilePhoto}`} 
                alt="Profile" 
                className="profile-photo-preview"
              />
            ) : (
              <div className="profile-photo-placeholder">
                {doctor.userId?.name?.charAt(0)}
              </div>
            )}
            <form onSubmit={handlePhotoUpload} className="photo-upload-form">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                className="file-input"
              />
              {profilePhoto && (
                <button type="submit" className="btn-primary btn-small">
                  Upload Photo
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Personal Information (Read-Only) */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          <p className="section-note">These details cannot be edited. Contact admin if changes are needed.</p>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <p>{doctor.userId?.name}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{doctor.userId?.email}</p>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <p>{doctor.phone}</p>
            </div>
            <div className="info-item">
              <label>Gender</label>
              <p style={{ textTransform: 'capitalize' }}>{doctor.gender}</p>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <p>{doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>Registration Type</label>
              <p style={{ textTransform: 'capitalize' }}>{doctor.registrationType || 'Online'}</p>
            </div>
          </div>
        </div>

        {/* Professional Information (Read-Only) */}
        <div className="profile-section">
          <h2>Professional Details</h2>
          <p className="section-note">Verified information from your registration. Contact admin for changes.</p>
          <div className="info-grid">
            <div className="info-item">
              <label>Qualification</label>
              <p>{doctor.qualification}</p>
            </div>
            <div className="info-item">
              <label>Specialization</label>
              <p>{doctor.specialization?.name}</p>
            </div>
            <div className="info-item">
              <label>Years of Experience</label>
              <p>{doctor.experience} years</p>
            </div>
            <div className="info-item">
              <label>Medical Registration Number</label>
              <p>{doctor.medicalRegistrationNumber}</p>
            </div>
            <div className="info-item">
              <label>Issuing Medical Council</label>
              <p>{doctor.issuingMedicalCouncil}</p>
            </div>
            <div className="info-item">
              <label>Current Hospital/Clinic</label>
              <p>{doctor.currentHospitalClinic}</p>
            </div>
            <div className="info-item">
              <label>Current Working City</label>
              <p>{doctor.currentWorkingCity}</p>
            </div>
            <div className="info-item">
              <label>Languages Spoken</label>
              <p>{doctor.languagesSpoken?.join(', ') || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Education Details */}
        {doctor.education && doctor.education.length > 0 && (
          <div className="profile-section">
            <h2>Education</h2>
            <div className="education-list">
              {doctor.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <h4>{edu.degree}</h4>
                  <p>{edu.institution}</p>
                  <p className="education-year">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Documents */}
        <div className="profile-section">
          <h2>Uploaded Documents</h2>
          <p className="section-note">Documents submitted during registration for verification</p>
          <div className="documents-grid">
            {doctor.idProof && (
              <div className="document-item">
                <label>Government ID (Aadhar/PAN)</label>
                <a 
                  href={`${process.env.REACT_APP_API_URL}/${doctor.idProof}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  📄 View Document
                </a>
              </div>
            )}
            {doctor.degreeDocument && (
              <div className="document-item">
                <label>Degree Certificate</label>
                <a 
                  href={`${process.env.REACT_APP_API_URL}/${doctor.degreeDocument}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  📄 View Document
                </a>
              </div>
            )}
            {doctor.licenseDocument && (
              <div className="document-item">
                <label>Medical License Certificate</label>
                <a 
                  href={`${process.env.REACT_APP_API_URL}/${doctor.licenseDocument}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                >
                  📄 View Document
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Approval Status */}
        <div className="profile-section">
          <h2>Account Status</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Approval Status</label>
              <p>
                {doctor.isApproved ? (
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Approved</span>
                ) : (
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>⏳ Pending</span>
                )}
              </p>
            </div>
            <div className="info-item">
              <label>Registration Date</label>
              <p>{new Date(doctor.createdAt).toLocaleDateString()}</p>
            </div>
            {doctor.rating && (
              <div className="info-item">
                <label>Rating</label>
                <p>⭐ {doctor.rating.toFixed(1)} ({doctor.totalRatings} reviews)</p>
              </div>
            )}
          </div>
        </div>

        {/* Consultation Details (Editable) */}
        {editing ? (
          <form onSubmit={handleSubmit} className="profile-section">
            <h2>Consultation Details (Editable)</h2>
            
            <div className="form-group">
              <label>Consultation Modes</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.consultationModes.video}
                    onChange={(e) => setFormData({
                      ...formData,
                      consultationModes: { ...formData.consultationModes, video: e.target.checked }
                    })}
                  />
                  Video Consultation
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.consultationModes.physical}
                    onChange={(e) => setFormData({
                      ...formData,
                      consultationModes: { ...formData.consultationModes, physical: e.target.checked }
                    })}
                  />
                  Physical Visit
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Video Consultation Fee (Credits)</label>
                <input
                  type="number"
                  value={formData.consultationFee.video}
                  onChange={(e) => setFormData({
                    ...formData,
                    consultationFee: { ...formData.consultationFee, video: parseInt(e.target.value) }
                  })}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Physical Visit Fee (Credits)</label>
                <input
                  type="number"
                  value={formData.consultationFee.physical}
                  onChange={(e) => setFormData({
                    ...formData,
                    consultationFee: { ...formData.consultationFee, physical: parseInt(e.target.value) }
                  })}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>About / Bio</label>
              <textarea
                rows="4"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                placeholder="Tell patients about yourself, your approach to treatment, etc."
              />
            </div>

            <div className="form-group">
              <label>Available Days</label>
              <div className="days-grid">
                {weekDays.map(day => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Maximum Patients Per Day</label>
              <input
                type="number"
                value={formData.maxPatientsPerDay}
                onChange={(e) => setFormData({ ...formData, maxPatientsPerDay: parseInt(e.target.value) })}
                min="1"
                max="50"
              />
            </div>

            <div className="form-group">
              <label>Follow-up Policy (Optional)</label>
              <textarea
                rows="3"
                value={formData.followUpPolicy}
                onChange={(e) => setFormData({ ...formData, followUpPolicy: e.target.value })}
                placeholder="e.g., Free follow-up within 7 days"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                Currently Available for Consultations
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-section">
            <h2>Consultation Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Consultation Modes</label>
                <p>
                  {doctor.consultationModes?.video && '📹 Video'}
                  {doctor.consultationModes?.video && doctor.consultationModes?.physical && ', '}
                  {doctor.consultationModes?.physical && '🏥 Physical'}
                </p>
              </div>
              <div className="info-item">
                <label>Video Fee</label>
                <p>{doctor.consultationFee?.video} credits</p>
              </div>
              <div className="info-item">
                <label>Physical Fee</label>
                <p>{doctor.consultationFee?.physical} credits</p>
              </div>
              <div className="info-item">
                <label>Max Patients/Day</label>
                <p>{doctor.maxPatientsPerDay}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>{doctor.isAvailable ? '✅ Available' : '❌ Unavailable'}</p>
              </div>
            </div>
            
            {doctor.about && (
              <div className="info-item full-width">
                <label>About</label>
                <p>{doctor.about}</p>
              </div>
            )}

            {doctor.availableDays && doctor.availableDays.length > 0 && (
              <div className="info-item full-width">
                <label>Available Days</label>
                <div className="days-display">
                  {doctor.availableDays.map(day => (
                    <span key={day} className="day-badge">{day}</span>
                  ))}
                </div>
              </div>
            )}

            {doctor.followUpPolicy && (
              <div className="info-item full-width">
                <label>Follow-up Policy</label>
                <p>{doctor.followUpPolicy}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorProfile;
