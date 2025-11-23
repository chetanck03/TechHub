import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiStar, FiCalendar, FiMessageCircle } from 'react-icons/fi';


const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canMessage, setCanMessage] = useState(false);
  const [consultationId, setConsultationId] = useState(null);

  useEffect(() => {
    fetchDoctor();
    checkMessageAccess();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${id}`);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMessageAccess = async () => {
    try {
      const response = await api.get(`/chat/check-access/${id}`);
      setCanMessage(response.data.canMessage);
      setConsultationId(response.data.consultationId);
    } catch (error) {
      console.error('Error checking message access:', error);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
  if (!doctor) return <Layout><div className="loading">Doctor not found</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <div className="doctor-profile">
          <div className="profile-header">
            {doctor.profilePhoto ? (
              <img src={`${process.env.REACT_APP_API_URL}/${doctor.profilePhoto}`} alt={doctor.name} className="doctor-avatar large" />
            ) : (
              <div className="doctor-avatar large">
                {doctor.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1>Dr. {doctor.name}</h1>
              <p className="specialization">{doctor.specialization?.name}</p>
              <p className="qualification">{doctor.qualification}</p>
              <div className="rating">
                <FiStar style={{ color: '#f59e0b' }} />
                <span>{doctor.rating?.toFixed(1) || 'New'} ({doctor.totalRatings || 0} reviews)</span>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="info-section">
              <h2>About Dr. {doctor.name}</h2>
              <p>{doctor.about || 'No description available yet.'}</p>
            </div>

            <div className="info-section">
              <h2>Professional Details</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Qualification</span>
                  <strong>{doctor.qualification}</strong>
                </div>
                <div className="detail-item">
                  <span>Specialization</span>
                  <strong>{doctor.specialization?.name}</strong>
                </div>
                <div className="detail-item">
                  <span>Experience</span>
                  <strong>{doctor.experience} years</strong>
                </div>
                <div className="detail-item">
                  <span>Current Practice</span>
                  <strong>{doctor.currentHospitalClinic}</strong>
                </div>
                <div className="detail-item">
                  <span>City</span>
                  <strong>{doctor.currentWorkingCity}</strong>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h2>Languages Spoken</h2>
              <div className="language-badges">
                {doctor.languagesSpoken?.map((lang, index) => (
                  <span key={index} className="language-badge">{lang}</span>
                ))}
              </div>
            </div>

            <div className="info-section">
              <h2>Consultation Options</h2>
              <div className="consultation-options">
                {doctor.consultationModes?.video && (
                  <div className="consultation-option">
                    <div className="option-icon">📹</div>
                    <div className="option-details">
                      <h3>Video Consultation</h3>
                      <p className="option-fee">{doctor.consultationFee?.video} credits</p>
                      <p className="option-desc">Consult from anywhere via video call</p>
                    </div>
                  </div>
                )}
                {doctor.consultationModes?.physical && (
                  <div className="consultation-option">
                    <div className="option-icon">🏥</div>
                    <div className="option-details">
                      <h3>Physical Visit</h3>
                      <p className="option-fee">{doctor.consultationFee?.physical} credits</p>
                      <p className="option-desc">Visit clinic at {doctor.currentHospitalClinic}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {doctor.availableDays && doctor.availableDays.length > 0 && (
              <div className="info-section">
                <h2>Available Days</h2>
                <div className="available-days">
                  {doctor.availableDays.map((day, index) => (
                    <span key={index} className="day-badge">{day}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              {doctor.isAvailable ? (
                <Link to={`/book/${doctor._id}`}>
                  <button className="btn-primary" style={{ width: '100%' }}>
                    <FiCalendar /> Book Consultation
                  </button>
                </Link>
              ) : (
                <button className="btn-disabled" style={{ width: '100%' }} disabled>
                  Currently Unavailable
                </button>
              )}
              
              {canMessage && consultationId && (
                <Link to={`/chat/${consultationId}`}>
                  <button className="btn-secondary" style={{ width: '100%' }}>
                    <FiMessageCircle /> Message Doctor
                  </button>
                </Link>
              )}
              
              {!canMessage && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: '#f0f0f0', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  💬 Complete a video consultation to unlock messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
