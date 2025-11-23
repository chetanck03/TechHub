import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DocumentViewer from '../../components/DocumentViewer';
import api from '../../utils/api';
import { toast } from 'react-toastify';


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
      <div className="h-full overflow-hidden flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Doctor Approvals</h1>
          <p className="text-secondary-600">Review and approve doctor registrations</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
          {doctors.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">👨‍⚕️</div>
                <p className="text-secondary-500 text-lg">No pending approvals</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pr-2">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary-900">Dr. {doctor.userId?.name}</h3>
                      <p className="text-primary-600 font-medium">{doctor.specialization?.name}</p>
                    </div>
                  </div>

                  <div className="card-body space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Email</span>
                        <p className="text-secondary-900">{doctor.userId?.email}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Phone</span>
                        <p className="text-secondary-900">{doctor.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Gender</span>
                        <p className="text-secondary-900 capitalize">{doctor.gender}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Date of Birth</span>
                        <p className="text-secondary-900">{new Date(doctor.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Medical Registration No</span>
                        <p className="text-secondary-900">{doctor.medicalRegistrationNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Issuing Council</span>
                        <p className="text-secondary-900">{doctor.issuingMedicalCouncil}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Qualification</span>
                        <p className="text-secondary-900">{doctor.qualification}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Experience</span>
                        <p className="text-secondary-900">{doctor.experience} years</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Current Hospital/Clinic</span>
                        <p className="text-secondary-900">{doctor.currentHospitalClinic}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Working City</span>
                        <p className="text-secondary-900">{doctor.currentWorkingCity}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Languages</span>
                        <p className="text-secondary-900">{doctor.languagesSpoken?.join(', ')}</p>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium text-secondary-500">Registration Type</span>
                        <p className="text-secondary-900 capitalize">{doctor.registrationType}</p>
                      </div>
                    </div>

                    {/* Document Viewer */}
                    {doctor.fileInfo && (
                      <div className="border-t border-secondary-200 pt-6">
                        <DocumentViewer 
                          doctorId={doctor._id} 
                          documents={doctor.fileInfo} 
                          doctorName={doctor.userId?.name} 
                        />
                      </div>
                    )}

                    <div className="flex gap-4 pt-6 border-t border-secondary-200">
                      <button
                        onClick={() => handleApprove(doctor._id)}
                        className="btn btn-success"
                      >
                        Approve Doctor
                      </button>
                      <button
                        onClick={() => setSelectedDoctor(doctor._id)}
                        className="btn btn-danger"
                      >
                        Reject Application
                      </button>
                    </div>

                    {selectedDoctor === doctor._id && (
                      <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 space-y-4">
                        <h4 className="font-semibold text-danger-800">Rejection Reason</h4>
                        <textarea
                          placeholder="Enter detailed rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows="3"
                          className="form-input"
                        />
                        <div className="flex gap-3">
                          <button onClick={handleReject} className="btn btn-danger btn-sm">
                            Submit Rejection
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDoctor(null);
                              setRejectionReason('');
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
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

export default DoctorApprovals;
