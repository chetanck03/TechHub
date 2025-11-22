import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import './Shared.css';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/complaints/my-complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      in_review: '#3b82f6',
      resolved: '#10b981'
    };
    return colors[status] || '#64748b';
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>My Complaints</h1>
          <button 
            className="btn-primary"
            onClick={() => window.location.href = '/complaints/new'}
          >
            File New Complaint
          </button>
        </div>

        {complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints filed yet</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/complaints/new'}
            >
              File Your First Complaint
            </button>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-header">
                  <div>
                    <h3>{complaint.subject}</h3>
                    {complaint.againstId ? (
                      <p>Against: {complaint.againstId.name || complaint.againstId.email}</p>
                    ) : (
                      <p>General Complaint</p>
                    )}
                    <p className="complaint-date">
                      {new Date(complaint.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ background: getStatusColor(complaint.status) }}
                  >
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="complaint-body">
                  <p>{complaint.description}</p>
                </div>

                {complaint.adminResponse && (
                  <div className="admin-response">
                    <strong>Admin Response:</strong>
                    <p>{complaint.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyComplaints;
