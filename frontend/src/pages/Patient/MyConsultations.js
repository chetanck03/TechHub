import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiVideo, FiMessageCircle } from 'react-icons/fi';


const MyConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations/my-consultations');
      setConsultations(response.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3b82f6',
      ongoing: '#f59e0b',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>My Consultations</h1>

        {consultations.length === 0 ? (
          <div className="loading">No consultations found</div>
        ) : (
          <div className="consultations-list">
            {consultations.map((consultation) => (
              <div key={consultation._id} className="consultation-card">
                <div className="consultation-header">
                  <div>
                    <h3>Dr. {consultation.doctorId?.userId?.name}</h3>
                    <p>{consultation.doctorId?.specialization?.name}</p>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(consultation.status) }}
                  >
                    {consultation.status}
                  </span>
                </div>

                <div className="consultation-details">
                  <div className="detail-item">
                    <span>Type:</span>
                    <strong>{consultation.type}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Date:</span>
                    <strong>{new Date(consultation.scheduledAt).toLocaleString()}</strong>
                  </div>
                  <div className="detail-item">
                    <span>Credits:</span>
                    <strong>{consultation.creditsCharged}</strong>
                  </div>
                </div>

                {consultation.notes && (
                  <div className="consultation-notes">
                    <strong>Notes:</strong>
                    <p>{consultation.notes}</p>
                  </div>
                )}

                <div className="consultation-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  {(consultation.status === 'scheduled' || consultation.status === 'ongoing') && consultation.type === 'online' && (
                    <Link to={`/video-call/${consultation._id}`}>
                      <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <FiVideo /> {consultation.status === 'ongoing' ? 'Rejoin' : 'Join'} Video Call
                      </button>
                    </Link>
                  )}
                  
                  {consultation.videoCallCompleted && (
                    <Link to={`/chat/${consultation._id}`}>
                      <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <FiMessageCircle /> Message Doctor
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyConsultations;
