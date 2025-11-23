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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Doctor Management</h1>
          <p className="text-secondary-600">Manage and monitor all registered doctors</p>
        </div>

        <div className="card mb-4 flex-shrink-0">
          <div className="card-body">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Specialization</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Experience</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Consultations</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-secondary-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-secondary-900">{doctor.userId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{doctor.specialization?.name || doctor.specialization || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{doctor.experience} years</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">
                      {doctor.consultationFee?.video 
                        ? `${doctor.consultationFee.video} credits` 
                        : 'Not set'}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{doctor.consultationCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{doctor.rating?.toFixed(1) || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        doctor.suspended 
                          ? 'bg-danger-100 text-danger-700' 
                          : doctor.isApproved 
                            ? 'bg-success-100 text-success-700' 
                            : 'bg-warning-100 text-warning-700'
                      }`}>
                        {doctor.suspended ? 'Suspended' : doctor.isApproved ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => viewDoctorDetails(doctor._id)}
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          className={`btn btn-sm btn-icon ${doctor.suspended ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleSuspend(doctor._id, doctor.suspended)}
                          title={doctor.suspended ? 'Activate' : 'Suspend'}
                        >
                          {doctor.suspended ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedDoctor(null)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="card-header">
                <h2 className="text-2xl font-bold text-secondary-900">Doctor Details</h2>
              </div>
              <div className="card-body space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Name</span>
                    <p className="text-secondary-900">{selectedDoctor.userId?.name || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Email</span>
                    <p className="text-secondary-900">{selectedDoctor.userId?.email || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Phone</span>
                    <p className="text-secondary-900">{selectedDoctor.phone || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Specialization</span>
                    <p className="text-secondary-900">{selectedDoctor.specialization?.name || selectedDoctor.specialization || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Experience</span>
                    <p className="text-secondary-900">{selectedDoctor.experience} years</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Qualification</span>
                    <p className="text-secondary-900">{selectedDoctor.qualification || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Registration No</span>
                    <p className="text-secondary-900">{selectedDoctor.medicalRegistrationNumber || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Video Consultation Fee</span>
                    <p className="text-secondary-900">{selectedDoctor.consultationFee?.video || 'Not set'} credits</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Physical Consultation Fee</span>
                    <p className="text-secondary-900">{selectedDoctor.consultationFee?.physical || 'Not set'} credits</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Credits</span>
                    <p className="text-secondary-900">{selectedDoctor.userId?.credits || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-secondary-500">Total Earnings</span>
                    <p className="text-secondary-900">{selectedDoctor.totalEarnings || 0}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Documents</h3>
                  <div className="flex gap-3">
                    {selectedDoctor.documents?.degree && (
                      <a 
                        href={`${process.env.REACT_APP_API_URL}/${selectedDoctor.documents.degree}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View Degree
                      </a>
                    )}
                    {selectedDoctor.documents?.license && (
                      <a 
                        href={`${process.env.REACT_APP_API_URL}/${selectedDoctor.documents.license}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View License
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Recent Consultations</h3>
                  {selectedDoctor.consultations?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDoctor.consultations.slice(0, 5).map((c) => (
                        <div key={c._id} className="p-3 bg-secondary-50 rounded-lg">
                          <span className="font-medium">{c.patientId?.name}</span> - 
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
                  <h3 className="text-lg font-semibold text-secondary-900 mb-3">Complaints Against Doctor</h3>
                  {selectedDoctor.complaints?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDoctor.complaints.map((c) => (
                        <div key={c._id} className="p-3 bg-danger-50 rounded-lg">
                          <span className="font-medium">{c.subject}</span> - 
                          <span className="ml-1 px-2 py-1 bg-danger-100 text-danger-700 rounded text-xs">{c.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary-500">No complaints</p>
                  )}
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary" onClick={() => setSelectedDoctor(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorManagement;
