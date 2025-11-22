import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const DoctorApprovals = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors/pending');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/status`, { status: 'approved' });
      toast.success('Doctor approved successfully!');
      fetchPendingDoctors();
    } catch (error) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await api.put(`/admin/doctors/${selectedDoctor}/status`, {
        status: 'rejected',
        rejectionReason
      });
      toast.success('Doctor rejected');
      setSelectedDoctor(null);
      setRejectionReason('');
      fetchPendingDoctors();
    } catch (error) {
      toast.error('Failed to reject doctor');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Doctor Approvals</h1>

        {doctors.length === 0 ? (
          <div className="loading">No pending approvals</div>
        ) : (
          <div className="approvals-list">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="approval-card">
                <div className="approval-header">
                  <div>
                    <h3>Dr. {doctor.userId?.name}</h3>
                    <p>{doctor.specialization?.name}</p>
                  </div>
                </div>

                <div className="approval-details">
                  <div className="detail-row">
                    <span>Email:</span>
                    <strong>{doctor.userId?.email}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Phone:</span>
                    <strong>{doctor.phone}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Gender:</span>
                    <strong>{doctor.gender}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Date of Birth:</span>
                    <strong>{new Date(doctor.dateOfBirth).toLocaleDateString()}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Medical Registration No:</span>
                    <strong>{doctor.medicalRegistrationNumber}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Issuing Council:</span>
                    <strong>{doctor.issuingMedicalCouncil}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Qualification:</span>
                    <strong>{doctor.qualification}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Experience:</span>
                    <strong>{doctor.experience} years</strong>
                  </div>
                  <div className="detail-row">
                    <span>Current Hospital/Clinic:</span>
                    <strong>{doctor.currentHospitalClinic}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Working City:</span>
                    <strong>{doctor.currentWorkingCity}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Languages:</span>
                    <strong>{doctor.languagesSpoken?.join(', ')}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Registration Type:</span>
                    <strong>{doctor.registrationType}</strong>
                  </div>
                </div>

                <div className="approval-actions">
                  <button
                    onClick={() => handleApprove(doctor._id)}
                    className="btn-approve"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setSelectedDoctor(doctor._id)}
                    className="btn-reject"
                  >
                    Reject
                  </button>
                </div>

                {selectedDoctor === doctor._id && (
                  <div className="rejection-form">
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="3"
                    />
                    <div className="rejection-actions">
                      <button onClick={handleReject} className="btn-primary">
                        Submit Rejection
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoctor(null);
                          setRejectionReason('');
                        }}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
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

export default DoctorApprovals;
