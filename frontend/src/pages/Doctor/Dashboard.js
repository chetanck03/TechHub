import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiCalendar, FiCreditCard, FiUsers, FiVideo, FiMessageCircle, FiAlertCircle } from 'react-icons/fi';
import './Doctor.css';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    consultations: 0,
    credits: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if doctor profile exists
      let profileExists = false;
      try {
        const profileRes = await api.get('/doctors/me/profile');
        setDoctorProfile(profileRes.data);
        profileExists = true;
      } catch (error) {
        if (error.response?.status === 404) {
          setProfileError(true);
        }
      }

      // Only fetch other data if profile exists
      if (profileExists) {
        const [consultationsRes, creditsRes] = await Promise.all([
          api.get('/consultations/my-consultations'),
          api.get('/users/credits')
        ]);
        
        const upcoming = consultationsRes.data.filter(c => c.status === 'scheduled');
        
        setStats({
          consultations: consultationsRes.data.length,
          credits: creditsRes.data.credits,
          upcomingAppointments: upcoming
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Doctor Dashboard</h1>

        {/* Show Complete Registration Alert if profile doesn't exist */}
        {profileError && (
          <div className="alert-banner" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}>
            <FiAlertCircle size={32} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                Complete Your Doctor Registration
              </h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                You need to complete your doctor profile with all required documents before you can start practicing on our platform.
              </p>
            </div>
            <button 
              onClick={() => navigate('/doctor/register')}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}
            >
              Complete Registration →
            </button>
          </div>
        )}

        {/* Show approval pending message if profile exists but not approved */}
        {doctorProfile && !doctorProfile.isApproved && (
          <div className="alert-banner" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.4)'
          }}>
            <FiAlertCircle size={32} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                Registration Pending Approval
              </h3>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Your doctor registration is under review by our admin team. You will receive an email once approved.
              </p>
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <FiCalendar className="stat-icon" />
            <div>
              <h3>{stats.consultations}</h3>
              <p>Total Consultations</p>
            </div>
          </div>
          <div className="stat-card">
            <FiCreditCard className="stat-icon" />
            <div>
              <h3>{stats.credits}</h3>
              <p>Available Credits</p>
            </div>
          </div>
          <div className="stat-card">
            <FiUsers className="stat-icon" />
            <div>
              <h3>{stats.upcomingAppointments.length}</h3>
              <p>Upcoming Appointments</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>Upcoming Appointments</h2>
          {stats.upcomingAppointments.length === 0 ? (
            <p>No upcoming appointments</p>
          ) : (
            <div className="appointments-list">
              {stats.upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="appointment-card">
                  <div style={{ flex: 1 }}>
                    <h3>{appointment.patientId?.name}</h3>
                    <p>{new Date(appointment.scheduledAt).toLocaleString()}</p>
                    <span className="appointment-type">{appointment.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {appointment.type === 'online' && (
                      <Link to={`/video-call/${appointment._id}`}>
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                          <FiVideo /> Join Call
                        </button>
                      </Link>
                    )}
                    {appointment.videoCallCompleted && (
                      <Link to={`/chat/${appointment._id}`}>
                        <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                          <FiMessageCircle /> Chat
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
