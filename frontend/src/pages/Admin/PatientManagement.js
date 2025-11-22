import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiLock, FiUnlock } from 'react-icons/fi';
import './Admin.css';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/admin/patients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (patientId, isBlocked) => {
    try {
      await api.patch(`/admin/patients/${patientId}/block`, { blocked: !isBlocked });
      toast.success(`Patient ${!isBlocked ? 'blocked' : 'unblocked'} successfully`);
      fetchPatients();
    } catch (error) {
      toast.error('Failed to update patient status');
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const response = await api.get(`/admin/patients/${patientId}`);
      setSelectedPatient(response.data);
    } catch (error) {
      toast.error('Failed to fetch patient details');
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Patient Management</h1>

        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Credits</th>
                <th>Consultations</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.credits || 0}</td>
                  <td>{patient.consultationCount || 0}</td>
                  <td>
                    <span className={`status-badge ${patient.blocked ? 'blocked' : 'active'}`}>
                      {patient.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => viewPatientDetails(patient._id)}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleBlockUnblock(patient._id, patient.blocked)}
                      title={patient.blocked ? 'Unblock' : 'Block'}
                    >
                      {patient.blocked ? <FiUnlock /> : <FiLock />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedPatient && (
          <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Patient Details</h2>
              <div className="details-grid">
                <div><strong>Name:</strong> {selectedPatient.name}</div>
                <div><strong>Email:</strong> {selectedPatient.email}</div>
                <div><strong>Phone:</strong> {selectedPatient.phone}</div>
                <div><strong>Credits:</strong> {selectedPatient.credits}</div>
                <div><strong>Location:</strong> {selectedPatient.location?.city || 'N/A'}</div>
                <div><strong>Joined:</strong> {new Date(selectedPatient.createdAt).toLocaleDateString()}</div>
              </div>
              
              <h3>Consultation History</h3>
              {selectedPatient.consultations?.length > 0 ? (
                <ul>
                  {selectedPatient.consultations.map((c) => (
                    <li key={c._id}>
                      {c.doctorId?.name} - {new Date(c.date).toLocaleDateString()} - {c.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No consultations yet</p>
              )}

              <h3>Complaints Filed</h3>
              {selectedPatient.complaints?.length > 0 ? (
                <ul>
                  {selectedPatient.complaints.map((c) => (
                    <li key={c._id}>
                      {c.subject} - {c.status}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No complaints filed</p>
              )}

              <button className="btn-primary" onClick={() => setSelectedPatient(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientManagement;
