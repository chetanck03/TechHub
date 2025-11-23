import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';


const FileComplaint = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { againstId, consultationId } = location.state || {};

  const [formData, setFormData] = useState({
    againstId: againstId || '',
    subject: '',
    description: ''
  });
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    
    // Only add againstId if it's not empty and looks like a valid MongoDB ObjectId
    if (formData.againstId && formData.againstId.trim().length === 24) {
      data.append('againstId', formData.againstId.trim());
    }
    
    if (consultationId) {
      data.append('consultationId', consultationId);
    }
    
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    
    files.forEach(file => {
      data.append('evidence', file);
    });

    try {
      await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Complaint submitted successfully!');
      navigate('/complaints');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
      console.error('Complaint error:', error.response?.data);
    }
  };

  return (
    <Layout>
      <div className="dashboard">
        <h1>File a Complaint</h1>
        <p className="subtitle">We take your concerns seriously</p>

        <div className="complaint-form">
          <form onSubmit={handleSubmit}>
            {!againstId && (
              <div className="form-group">
                <label>Complaint Against (User ID) - Optional</label>
                <input
                  type="text"
                  value={formData.againstId}
                  onChange={(e) => setFormData({ ...formData, againstId: e.target.value })}
                  placeholder="Enter user ID (optional - leave blank for general complaint)"
                />
                <small>Leave blank for general complaints or platform issues</small>
              </div>
            )}

            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="Brief description of the issue"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows="6"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Provide detailed information about your complaint..."
              />
            </div>

            <div className="form-group">
              <label>Evidence (Optional)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                accept="image/*,.pdf"
                className="file-input"
              />
              <small>Upload images or documents as evidence (max 5 files)</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Submit Complaint
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default FileComplaint;
