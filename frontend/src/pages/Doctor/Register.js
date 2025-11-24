import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';


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
      console.log('Fetching categories...');
      const response = await api.get('/categories');
      console.log('Categories response:', response.data);
      setCategories(response.data);
      
      if (response.data.length === 0) {
        console.warn('No categories found in database');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
      
      // Set some default categories as fallback
      const fallbackCategories = [
        { _id: 'temp1', name: 'General Physician' },
        { _id: 'temp2', name: 'Cardiologist' },
        { _id: 'temp3', name: 'Dermatologist' },
        { _id: 'temp4', name: 'Pediatrician' },
        { _id: 'temp5', name: 'Gynecologist' }
      ];
      setCategories(fallbackCategories);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Registration</h1>
            <p className="text-lg text-gray-600">Complete your profile to start practicing on our platform</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Admin approval required after submission
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500">Basic details about yourself</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Photo <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setFiles({ ...files, profilePhoto: e.target.files[0] })}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 2MB - JPG, PNG</p>
                  {files.profilePhoto && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {files.profilePhoto.name} ({(files.profilePhoto.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Professional Details</h2>
                  <p className="text-sm text-gray-500">Required for verification</p>
                </div>
              </div>
              
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
                <small>Upload your Aadhar card, PAN card, or any government-issued ID (Max 5MB)</small>
                {files.idProof && (
                  <div className="file-info">
                    ✅ Selected: {files.idProof.name} ({(files.idProof.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
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
                <small>Upload your medical degree certificate (MBBS, MD, etc.) (Max 5MB)</small>
                {files.degreeDocument && (
                  <div className="file-info">
                    ✅ Selected: {files.degreeDocument.name} ({(files.degreeDocument.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
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
                <small>Upload your medical council registration/license certificate (Max 5MB)</small>
                {files.licenseDocument && (
                  <div className="file-info">
                    ✅ Selected: {files.licenseDocument.name} ({(files.licenseDocument.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
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
                  <li>🔒 All documents are securely stored in our database</li>
                  <li>📁 Supported formats: PDF, JPG, PNG (Max 5MB per file)</li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Submit?</h3>
              <p className="text-blue-100 mb-6">Your registration will be reviewed by our admin team within 24-48 hours</p>
              <button 
                type="submit" 
                className="bg-white text-blue-600 px-12 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submit Registration for Approval
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorRegister;
