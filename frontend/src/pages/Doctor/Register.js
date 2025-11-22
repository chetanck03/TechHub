import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Doctor.css';

const DoctorRegister = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    dateOfBirth: '',
    medicalRegistrationNumber: '',
    issuingMedicalCouncil: '',
    qualification: '',
    specialization: '',
    experience: '',
    currentHospitalClinic: '',
    currentWorkingCity: '',
    languagesSpoken: [],
    about: '',
    registrationType: 'online',
    education: [{ degree: '', institution: '', year: '' }]
  });
  const [files, setFiles] = useState({
    profilePhoto: null,
    degreeDocument: null,
    licenseDocument: null,
    idProof: null
  });
  const [languageInput, setLanguageInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddLanguage = () => {
    if (languageInput.trim()) {
      setFormData({
        ...formData,
        languagesSpoken: [...formData.languagesSpoken, languageInput.trim()]
      });
      setLanguageInput('');
    }
  };

  const handleRemoveLanguage = (index) => {
    setFormData({
      ...formData,
      languagesSpoken: formData.languagesSpoken.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'education' || key === 'languagesSpoken') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Add files
    if (files.profilePhoto) data.append('profilePhoto', files.profilePhoto);
    if (files.degreeDocument) data.append('degreeDocument', files.degreeDocument);
    if (files.licenseDocument) data.append('licenseDocument', files.licenseDocument);
    if (files.idProof) data.append('idProof', files.idProof);

    try {
      await api.post('/doctors/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Registration submitted successfully!', { autoClose: 5000 });
      toast.info('Your registration is pending admin approval. You will receive an email once approved.', { autoClose: 8000 });
      toast.warning('You cannot login until your registration is approved by admin.', { autoClose: 8000 });
      
      // Logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Your doctor registration is pending approval. You will receive an email once approved. You cannot login until then.' 
          }
        });
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Layout>
      <div className="dashboard">
        <h1>Doctor Registration</h1>
        <p className="subtitle">Complete your profile to start practicing on our platform</p>

        <div className="register-form">
          <form onSubmit={handleSubmit}>
            
            {/* Personal Information */}
            <div className="form-section">
              <h2>Personal Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+1234567890"
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Profile Photo</label>
                  <input
                    type="file"
                    onChange={(e) => setFiles({ ...files, profilePhoto: e.target.files[0] })}
                    accept="image/*"
                    className="file-input"
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="form-section">
              <h2>Professional Details (Required for Verification)</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Qualification *</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                    placeholder="MBBS, MD, MS, BDS, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  >
                    <option value="">Select Specialization</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Years of Experience *</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                    min="0"
                    placeholder="5"
                  />
                </div>

                <div className="form-group">
                  <label>Medical Registration Number (MCI/SMC) *</label>
                  <input
                    type="text"
                    value={formData.medicalRegistrationNumber}
                    onChange={(e) => setFormData({ ...formData, medicalRegistrationNumber: e.target.value })}
                    required
                    placeholder="MED12345"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Issuing Medical Council Name *</label>
                <input
                  type="text"
                  value={formData.issuingMedicalCouncil}
                  onChange={(e) => setFormData({ ...formData, issuingMedicalCouncil: e.target.value })}
                  required
                  placeholder="e.g., Medical Council of India"
                />
              </div>
            </div>

            {/* Required Documents */}
            <div className="form-section">
              <h2>Required Documents (Must Upload at Registration)</h2>
              <p className="form-note">All documents are required for verification. Accepted formats: PDF, JPG, PNG</p>
              
              <div className="form-group">
                <label>Government ID (Aadhar/PAN) *</label>
                <input
                  type="file"
                  onChange={(e) => setFiles({ ...files, idProof: e.target.files[0] })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="file-input"
                />
                <small>Upload your Aadhar card, PAN card, or any government-issued ID</small>
              </div>

              <div className="form-group">
                <label>Degree Certificate *</label>
                <input
                  type="file"
                  onChange={(e) => setFiles({ ...files, degreeDocument: e.target.files[0] })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="file-input"
                />
                <small>Upload your medical degree certificate (MBBS, MD, etc.)</small>
              </div>

              <div className="form-group">
                <label>Medical License Certificate *</label>
                <input
                  type="file"
                  onChange={(e) => setFiles({ ...files, licenseDocument: e.target.files[0] })}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  className="file-input"
                />
                <small>Upload your medical council registration/license certificate</small>
              </div>
            </div>



            {/* Current Practice */}
            <div className="form-section">
              <h2>Current Practice</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Current Hospital/Clinic Name *</label>
                  <input
                    type="text"
                    value={formData.currentHospitalClinic}
                    onChange={(e) => setFormData({ ...formData, currentHospitalClinic: e.target.value })}
                    required
                    placeholder="City Hospital"
                  />
                </div>

                <div className="form-group">
                  <label>Current Working City *</label>
                  <input
                    type="text"
                    value={formData.currentWorkingCity}
                    onChange={(e) => setFormData({ ...formData, currentWorkingCity: e.target.value })}
                    required
                    placeholder="New York"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Languages Spoken *</label>
                <div className="language-input">
                  <input
                    type="text"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    placeholder="Enter language and click Add"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLanguage())}
                  />
                  <button type="button" onClick={handleAddLanguage} className="btn-add">
                    Add
                  </button>
                </div>
                <div className="language-tags">
                  {formData.languagesSpoken.map((lang, index) => (
                    <span key={index} className="language-tag">
                      {lang}
                      <button type="button" onClick={() => handleRemoveLanguage(index)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="info-box">
                <h3>📋 Important Information</h3>
                <ul>
                  <li>✅ All fields marked with * are mandatory</li>
                  <li>✅ Your registration will be reviewed by our admin team</li>
                  <li>✅ You will receive an email once your profile is approved</li>
                  <li>✅ You cannot login until admin approves your registration</li>
                  <li>✅ After approval, you can update consultation details, fees, and slots</li>
                </ul>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-large">
              Submit Registration for Approval
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorRegister;
