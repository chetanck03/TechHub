import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import MyDocuments from '../../components/MyDocuments';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiEdit3, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward, FiBook } from 'react-icons/fi';


const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
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
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    currentHospitalClinic: '',
    currentWorkingCity: '',
    languagesSpoken: [],
    about: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchDoctorProfile();
    fetchCategories();
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
      setPersonalData({
        name: response.data.userId?.name || '',
        email: response.data.userId?.email || '',
        phone: response.data.phone || '',
        currentHospitalClinic: response.data.currentHospitalClinic || '',
        currentWorkingCity: response.data.currentWorkingCity || '',
        languagesSpoken: response.data.languagesSpoken || [],
        about: response.data.about || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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
      toast.success('Consultation details updated successfully');
      setEditing(false);
      fetchDoctorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.put('/doctors/me/personal-info', personalData);
      toast.success('Personal information updated successfully');
      setEditingPersonal(false);
      fetchDoctorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update personal information');
    }
  }; 
  
  const handleLanguageAdd = (language) => {
    if (language && !personalData.languagesSpoken.includes(language)) {
      setPersonalData({
        ...personalData,
        languagesSpoken: [...personalData.languagesSpoken, language]
      });
    }
  };

  const handleLanguageRemove = (language) => {
    setPersonalData({
      ...personalData,
      languagesSpoken: personalData.languagesSpoken.filter(lang => lang !== language)
    });
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

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-secondary-600">Loading...</span>
      </div>
    </Layout>
  );

  if (!doctor) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-secondary-600">Profile not found</p>
        </div>
      </div>
    </Layout>
  );

  if (!doctor.isApproved) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-body text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">Profile Pending Approval</h2>
              <p className="text-secondary-600 mb-2">Your doctor profile is currently under review by our admin team.</p>
              <p className="text-secondary-600 mb-4">You will receive an email notification once your profile is approved.</p>
              <p className="text-sm"><span className="font-semibold">Status:</span> {doctor.status}</p>
              {doctor.rejectionReason && (
                <div className="mt-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-left">
                  <h4 className="font-semibold text-danger-800 mb-2">Rejection Reason:</h4>
                  <p className="text-danger-700">{doctor.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }  
return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">My Profile</h1>
            <p className="text-secondary-600">Manage your professional profile and consultation settings</p>
          </div>
          {!editing && (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <FiEdit3 className="w-4 h-4" />
              Edit Consultation Details
            </button>
          )}
        </div>

        {/* Profile Photo Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-secondary-900">Profile Photo</h2>
          </div>
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                {doctor.profilePhoto && doctor.profilePhoto.data ? (
                  <img 
                    src={`data:${doctor.profilePhoto.contentType};base64,${doctor.profilePhoto.data}`}
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600 border-4 border-primary-200 ${
                    (doctor.profilePhoto && doctor.profilePhoto.data) ? 'hidden' : 'flex'
                  }`}
                >
                  {doctor.userId?.name?.charAt(0) || 'D'}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-secondary-900 mb-2">Profile Photo Status</h4>
                {doctor.profilePhoto && doctor.profilePhoto.data ? (
                  <div className="space-y-1">
                    <p className="text-success-600 font-medium">✅ Photo Uploaded</p>
                    <p className="text-sm text-secondary-500">File: {doctor.profilePhoto.originalName}</p>
                    <p className="text-sm text-secondary-500">Size: {(doctor.profilePhoto.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <p className="text-warning-600 font-medium">📷 No photo uploaded</p>
                )}
                
                <form onSubmit={handlePhotoUpload} className="mt-4 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePhoto(e.target.files[0])}
                    className="form-input"
                  />
                  {profilePhoto && (
                    <button type="submit" className="btn btn-primary btn-sm">
                      {doctor.profilePhoto && doctor.profilePhoto.data ? 'Update Photo' : 'Upload Photo'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>       
 {/* Personal Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            {doctor.isApproved && !editingPersonal && (
              <button 
                className="btn-edit"
                onClick={() => setEditingPersonal(true)}
              >
                <FiEdit3 /> Edit Personal Info
              </button>
            )}
          </div>

          {editingPersonal ? (
            <form onSubmit={handlePersonalSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label><FiUser /> Full Name</label>
                  <input
                    type="text"
                    value={personalData.name}
                    onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiMail /> Email</label>
                  <input
                    type="email"
                    value={personalData.email}
                    disabled
                    className="disabled-input"
                    title="Email cannot be changed"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FiPhone /> Phone Number</label>
                  <input
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiMapPin /> Current Hospital/Clinic</label>
                  <input
                    type="text"
                    value={personalData.currentHospitalClinic}
                    onChange={(e) => setPersonalData({ ...personalData, currentHospitalClinic: e.target.value })}
                    required
                  />
                </div>
              </div>  
            <div className="form-row">
                <div className="form-group">
                  <label><FiMapPin /> Current Working City</label>
                  <input
                    type="text"
                    value={personalData.currentWorkingCity}
                    onChange={(e) => setPersonalData({ ...personalData, currentWorkingCity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Languages Spoken</label>
                <div className="languages-input">
                  <div className="languages-list">
                    {personalData.languagesSpoken.map((lang, index) => (
                      <span key={index} className="language-tag">
                        {lang}
                        <button
                          type="button"
                          onClick={() => handleLanguageRemove(lang)}
                          className="remove-language"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add language and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLanguageAdd(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>About / Bio</label>
                <textarea
                  rows="4"
                  value={personalData.about}
                  onChange={(e) => setPersonalData({ ...personalData, about: e.target.value })}
                  placeholder="Tell patients about yourself, your approach to treatment, etc."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <FiSave /> Save Changes
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setEditingPersonal(false);
                    setPersonalData({
                      name: doctor.userId?.name || '',
                      email: doctor.userId?.email || '',
                      phone: doctor.phone || '',
                      currentHospitalClinic: doctor.currentHospitalClinic || '',
                      currentWorkingCity: doctor.currentWorkingCity || '',
                      languagesSpoken: doctor.languagesSpoken || [],
                      about: doctor.about || ''
                    });
                  }}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </form>   
       ) : (
            <div className="info-grid">
              <div className="info-item">
                <FiUser className="info-icon" />
                <div>
                  <label>Full Name</label>
                  <p>{doctor.userId?.name}</p>
                </div>
              </div>
              <div className="info-item">
                <FiMail className="info-icon" />
                <div>
                  <label>Email</label>
                  <p>{doctor.userId?.email}</p>
                </div>
              </div>
              <div className="info-item">
                <FiPhone className="info-icon" />
                <div>
                  <label>Phone Number</label>
                  <p>{doctor.phone}</p>
                </div>
              </div>
              <div className="info-item">
                <FiUser className="info-icon" />
                <div>
                  <label>Gender</label>
                  <p style={{ textTransform: 'capitalize' }}>{doctor.gender}</p>
                </div>
              </div>
              <div className="info-item">
                <FiCalendar className="info-icon" />
                <div>
                  <label>Date of Birth</label>
                  <p>{doctor.dateOfBirth ? new Date(doctor.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
              <div className="info-item">
                <FiMapPin className="info-icon" />
                <div>
                  <label>Current Hospital/Clinic</label>
                  <p>{doctor.currentHospitalClinic}</p>
                </div>
              </div>
              <div className="info-item">
                <FiMapPin className="info-icon" />
                <div>
                  <label>Current Working City</label>
                  <p>{doctor.currentWorkingCity}</p>
                </div>
              </div>
              <div className="info-item">
                <div>
                  <label>Languages Spoken</label>
                  <div className="languages-display">
                    {doctor.languagesSpoken && doctor.languagesSpoken.length > 0 ? (
                      doctor.languagesSpoken.map((lang, index) => (
                        <span key={index} className="language-badge">{lang}</span>
                      ))
                    ) : (
                      <p>Not specified</p>
                    )}
                  </div>
                </div>
              </div>
              {doctor.about && (
                <div className="info-item full-width">
                  <label>About</label>
                  <p>{doctor.about}</p>
                </div>
              )}
            </div>
          )}
        </div>        
{/* Professional Information (Read-Only) */}
        <div className="profile-section">
          <h2>Professional Details</h2>
          <p className="section-note">Verified information from your registration. Contact admin for changes.</p>
          <div className="professional-grid">
            <div className="professional-item">
              <FiAward className="info-icon" />
              <h4>Qualification</h4>
              <p>{doctor.qualification}</p>
            </div>
            <div className="professional-item">
              <FiBook className="info-icon" />
              <h4>Specialization</h4>
              <p>{doctor.specialization?.name}</p>
            </div>
            <div className="professional-item">
              <FiCalendar className="info-icon" />
              <h4>Years of Experience</h4>
              <p>{doctor.experience} years</p>
            </div>
            <div className="professional-item">
              <FiUser className="info-icon" />
              <h4>Medical Registration Number</h4>
              <p>{doctor.medicalRegistrationNumber}</p>
            </div>
            <div className="professional-item">
              <FiAward className="info-icon" />
              <h4>Issuing Medical Council</h4>
              <p>{doctor.issuingMedicalCouncil}</p>
            </div>
            <div className="professional-item">
              <FiMapPin className="info-icon" />
              <h4>Registration Date</h4>
              <p>{new Date(doctor.createdAt).toLocaleDateString()}</p>
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
        <MyDocuments 
          doctorId={doctor._id} 
          doctorData={doctor} 
          onDocumentUpdate={fetchDoctorProfile}
        />        {/* 
Account Status & Statistics */}
        <div className="profile-section">
          <h2>Account Status & Statistics</h2>
          <div className="professional-grid">
            <div className="professional-item">
              <h4>Approval Status</h4>
              {doctor.isApproved ? (
                <span className="status-badge status-approved">✅ Approved</span>
              ) : doctor.status === 'rejected' ? (
                <span className="status-badge status-rejected">❌ Rejected</span>
              ) : (
                <span className="status-badge status-pending">⏳ Pending Approval</span>
              )}
            </div>
            
            <div className="professional-item">
              <h4>Account Status</h4>
              {doctor.suspended ? (
                <span className="status-badge status-rejected">🚫 Suspended</span>
              ) : doctor.status === 'approved' ? (
                <span className="status-badge status-approved">✅ Active</span>
              ) : (
                <span className="status-badge status-pending">⏳ Under Review</span>
              )}
            </div>

            <div className="professional-item">
              <h4>Platform Fee</h4>
              {doctor.platformFeePaid ? (
                <span className="status-badge status-approved">✅ Paid (${doctor.registrationFee || 10})</span>
              ) : (
                <span className="status-badge status-pending">⏳ Pending (${doctor.registrationFee || 10})</span>
              )}
            </div>

            {doctor.approvedAt && (
              <div className="professional-item">
                <h4>Approved Date</h4>
                <p>{new Date(doctor.approvedAt).toLocaleDateString()}</p>
              </div>
            )}

            {doctor.rating > 0 && (
              <div className="professional-item">
                <h4>Patient Rating</h4>
                <p>⭐ {doctor.rating.toFixed(1)} ({doctor.totalRatings} reviews)</p>
              </div>
            )}

            <div className="professional-item">
              <h4>Total Consultations</h4>
              <p>{doctor.totalConsultations || 0} consultations</p>
            </div>

            <div className="professional-item">
              <h4>Availability Status</h4>
              {doctor.isAvailable ? (
                <span className="status-badge status-approved">✅ Available</span>
              ) : (
                <span className="status-badge status-pending">❌ Unavailable</span>
              )}
            </div>

            <div className="professional-item">
              <h4>Member Since</h4>
              <p>{new Date(doctor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {doctor.rejectionReason && (
            <div style={{ 
              marginTop: '2rem',
              padding: '1.5rem', 
              background: '#fee2e2', 
              border: '1px solid #fecaca', 
              borderRadius: '12px'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#991b1b' }}>Rejection Reason</h4>
              <p style={{ margin: 0 }}>{doctor.rejectionReason}</p>
            </div>
          )}
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
          </form>        )
 : (
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