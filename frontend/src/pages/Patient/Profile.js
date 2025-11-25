import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';


const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    location: { city: '', state: '', country: '' },
    bloodGroup: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    medicalHistory: {
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      previousSurgeries: []
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-secondary-600">Loading...</span>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">My Profile</h1>
          <p className="text-sm sm:text-base text-secondary-600">Manage your personal information and preferences</p>
        </div>

        <div className="card">
          <div className="card-header p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">Personal Information</h2>
          </div>
          <div className="card-body p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Age *</label>
                  <input
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="form-input text-sm sm:text-base"
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="form-input text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Gender *</label>
                  <select
                    value={profile.gender || ''}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="form-input text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Blood Group</label>
                  <select
                    value={profile.bloodGroup || ''}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="form-input text-sm sm:text-base"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Phone Number *</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="form-input text-sm sm:text-base"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">City *</label>
                  <input
                    type="text"
                    value={profile.location?.city || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      location: { ...profile.location, city: e.target.value }
                    })}
                    className="form-input text-sm sm:text-base"
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">State</label>
                  <input
                    type="text"
                    value={profile.location?.state || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      location: { ...profile.location, state: e.target.value }
                    })}
                    className="form-input text-sm sm:text-base"
                    placeholder="Enter your state"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Country</label>
                  <input
                    type="text"
                    value={profile.location?.country || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      location: { ...profile.location, country: e.target.value }
                    })}
                    className="form-input text-sm sm:text-base"
                    placeholder="Enter your country"
                  />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="form-group">
                    <label className="form-label text-sm sm:text-base">Contact Name</label>
                    <input
                      type="text"
                      value={profile.emergencyContact?.name || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        emergencyContact: { ...profile.emergencyContact, name: e.target.value }
                      })}
                      className="form-input text-sm sm:text-base"
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-sm sm:text-base">Contact Phone</label>
                    <input
                      type="tel"
                      value={profile.emergencyContact?.phone || ''}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        emergencyContact: { ...profile.emergencyContact, phone: e.target.value }
                      })}
                      className="form-input text-sm sm:text-base"
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label text-sm sm:text-base">Relationship</label>
                  <input
                    type="text"
                    value={profile.emergencyContact?.relationship || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      emergencyContact: { ...profile.emergencyContact, relationship: e.target.value }
                    })}
                    className="form-input text-sm sm:text-base"
                    placeholder="Relationship (e.g., Spouse, Parent, Sibling)"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="btn btn-primary w-full sm:w-auto text-sm sm:text-base">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
