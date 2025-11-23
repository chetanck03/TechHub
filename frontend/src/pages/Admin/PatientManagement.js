import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEye, FiLock, FiUnlock } from 'react-icons/fi';


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
      <div className="h-full flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Patient Management</h1>
          <p className="text-secondary-600">Manage and monitor all registered patients</p>
        </div>

        <div className="card mb-4 flex-shrink-0">
          <div className="card-body">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
        </div>

        <div className="card flex-1 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto h-full scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Credits</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Consultations</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-secondary-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-secondary-900">{patient.name}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{patient.email}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{patient.phone}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{patient.credits || 0}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{patient.consultationCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        patient.blocked 
                          ? 'bg-danger-100 text-danger-700' 
                          : 'bg-success-100 text-success-700'
                      }`}>
                        {patient.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => viewPatientDetails(patient._id)}
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className={`btn btn-sm btn-icon ${patient.blocked ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleBlockUnblock(patient._id, patient.blocked)}
                          title={patient.blocked ? 'Unblock' : 'Block'}
                        >
                          {patient.blocked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPatient(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="card-header">
                <h2 className="text-2xl font-bold text-secondary-900">Patient Details</h2>
              </div>
              <div className="card-body space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Name</span>
                    <p className="text-secondary-900">{selectedPatient.name}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Email</span>
                    <p className="text-secondary-900">{selectedPatient.email}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Phone</span>
                    <p className="text-secondary-900">{selectedPatient.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Credits</span>
                    <p className="text-secondary-900">{selectedPatient.credits}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Location</span>
                    <p className="text-secondary-900">{selectedPatient.location?.city || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Joined</span>
                    <p className="text-secondary-900">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Consultation History</h3>
                  {selectedPatient.consultations?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.consultations.map((c) => (
                        <div key={c._id} className="p-3 bg-secondary-50 rounded-lg">
                          <span className="font-medium">{c.doctorId?.name}</span> - 
                          <span className="text-secondary-600 ml-1">{new Date(c.date).toLocaleDateString()}</span> - 
                          <span className="ml-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">{c.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-500">No consultations yet</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Complaints Filed</h3>
                  {selectedPatient.complaints?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.complaints.map((c) => (
                        <div key={c._id} className="p-3 bg-warning-50 rounded-lg">
                          <span className="font-medium">{c.subject}</span> - 
                          <span className="ml-1 px-2 py-1 bg-warning-100 text-warning-700 rounded text-xs">{c.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-500">No complaints filed</p>
                  )}
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary" onClick={() => setSelectedPatient(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientManagement;
