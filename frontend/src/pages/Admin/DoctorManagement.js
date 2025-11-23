import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiLock, FiUnlock } from 'react-icons/fi';


const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (doctorId, isSuspended) => {
    try {
      await api.patch(`/admin/doctors/${doctorId}/suspend`, { suspended: !isSuspended });
      toast.success(`Doctor ${!isSuspended ? 'suspended' : 'activated'} successfully`);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to update doctor status');
    }
  };

  const viewDoctorDetails = async (doctorId) => {
    try {
      const response = await api.get(`/admin/doctors/${doctorId}/details`);
      setSelectedDoctor(response.data);
    } catch (error) {
      toast.error('Failed to fetch doctor details');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const name = doctor.userId?.name?.toLowerCase() || '';
    const spec = typeof doctor.specialization === 'string' 
      ? doctor.specialization.toLowerCase() 
      : doctor.specialization?.name?.toLowerCase() || '';
    return name.includes(searchTerm.toLowerCase()) || spec.includes(searchTerm.toLowerCase());
  });

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Doctor Management</h1>

        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search doctors by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Consultations</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.userId?.name || 'N/A'}</td>
                  <td>{doctor.specialization?.name || doctor.specialization || 'N/A'}</td>
                  <td>{doctor.experience} years</td>
                  <td>
                    {doctor.consultationFee?.video 
                      ? `${doctor.consultationFee.video} credits` 
                      : 'Not set'}
                  </td>
                  <td>{doctor.consultationCount || 0}</td>
                  <td>{doctor.rating?.toFixed(1) || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${doctor.suspended ? 'suspended' : doctor.isApproved ? 'approved' : 'pending'}`}>
                      {doctor.suspended ? 'Suspended' : doctor.isApproved ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => viewDoctorDetails(doctor._id)}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleSuspend(doctor._id, doctor.suspended)}
                      title={doctor.suspended ? 'Activate' : 'Suspend'}
                    >
                      {doctor.suspended ? <FiUnlock /> : <FiLock />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedDoctor && (
          <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <h2>Doctor Details</h2>
              <div className="details-grid">
                <div><strong>Name:</strong> {selectedDoctor.userId?.name || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedDoctor.userId?.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedDoctor.phone || 'N/A'}</div>
                <div><strong>Specialization:</strong> {selectedDoctor.specialization?.name || selectedDoctor.specialization || 'N/A'}</div>
                <div><strong>Experience:</strong> {selectedDoctor.experience} years</div>
                <div><strong>Qualification:</strong> {selectedDoctor.qualification || 'N/A'}</div>
                <div><strong>Registration No:</strong> {selectedDoctor.medicalRegistrationNumber || 'N/A'}</div>
                <div><strong>Consultation Fee (Video):</strong> {selectedDoctor.consultationFee?.video || 'Not set'} credits</div>
                <div><strong>Consultation Fee (Physical):</strong> {selectedDoctor.consultationFee?.physical || 'Not set'} credits</div>
                <div><strong>Credits:</strong> {selectedDoctor.userId?.credits || 0}</div>
                <div><strong>Total Earnings:</strong> {selectedDoctor.totalEarnings || 0}</div>
              </div>

              <h3>Documents</h3>
              <div className="documents-list">
                {selectedDoctor.documents?.degree && (
                  <a href={`${process.env.REACT_APP_API_URL}/${selectedDoctor.documents.degree}`} target="_blank" rel="noopener noreferrer">
                    View Degree
                  </a>
                )}
                {selectedDoctor.documents?.license && (
                  <a href={`${process.env.REACT_APP_API_URL}/${selectedDoctor.documents.license}`} target="_blank" rel="noopener noreferrer">
                    View License
                  </a>
                )}
              </div>

              <h3>Recent Consultations</h3>
              {selectedDoctor.consultations?.length > 0 ? (
                <ul>
                  {selectedDoctor.consultations.slice(0, 5).map((c) => (
                    <li key={c._id}>
                      {c.patientId?.name} - {new Date(c.date).toLocaleDateString()} - {c.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No consultations yet</p>
              )}

              <h3>Complaints Against Doctor</h3>
              {selectedDoctor.complaints?.length > 0 ? (
                <ul>
                  {selectedDoctor.complaints.map((c) => (
                    <li key={c._id}>
                      {c.subject} - {c.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No complaints</p>
              )}

              <button className="btn-primary" onClick={() => setSelectedDoctor(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorManagement;
