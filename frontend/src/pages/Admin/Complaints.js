import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const response = await api.get(`/admin/complaints${params}`);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaintId, status, response) => {
    try {
      await api.put(`/admin/complaints/${complaintId}`, {
        status,
        adminResponse: response
      });
      toast.success('Complaint updated successfully!');
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to update complaint');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Complaints Management</h1>

        <div className="filters">
          <button
            className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={filter === 'doctor' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('doctor')}
          >
            Doctor Complaints
          </button>
          <button
            className={filter === 'patient' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter('patient')}
          >
            Patient Complaints
          </button>
        </div>

        {complaints.length === 0 ? (
          <div className="loading">No complaints found</div>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-header">
                  <div>
                    <h3>{complaint.subject}</h3>
                    <p>
                      From: {complaint.complainantId?.name || 'Unknown'} | 
                      Against: {complaint.againstId?.name || 'General/Platform'}
                    </p>
                  </div>
                  <span className={`status-badge ${complaint.status}`}>
                    {complaint.status}
                  </span>
                </div>

                <div className="complaint-body">
                  <p>{complaint.description}</p>
                </div>

                {complaint.status === 'pending' && (
                  <div className="complaint-actions">
                    <button
                      onClick={() => handleUpdateStatus(complaint._id, 'in_review', 'Under review')}
                      className="btn-primary"
                    >
                      Mark as In Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(complaint._id, 'resolved', 'Resolved')}
                      className="btn-approve"
                    >
                      Resolve
                    </button>
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

export default Complaints;
