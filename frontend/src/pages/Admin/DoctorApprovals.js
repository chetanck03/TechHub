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
      <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctor Approvals</h1>
                <p className="text-gray-600">Review and approve doctor registrations</p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {doctors.length} Pending
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {doctors.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white rounded-2xl shadow-lg p-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500 text-lg">No pending doctor approvals at the moment</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pr-2">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Doctor Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex items-center gap-4">
                      {doctor.profilePhoto ? (
                        <img 
                          src={`data:${doctor.profilePhoto.contentType};base64,${doctor.profilePhoto.data}`}
                          alt={doctor.userId?.name}
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                          <span className="text-3xl font-bold text-blue-600">
                            {doctor.userId?.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-1">Dr. {doctor.userId?.name}</h3>
                        <p className="text-blue-100 font-medium text-lg">{doctor.specialization?.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {doctor.experience} years experience
                          </span>
                          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {doctor.qualification}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.userId?.email}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.phone}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</span>
                          <p className="text-gray-900 font-medium mt-1 capitalize">{doctor.gender}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date of Birth</span>
                          <p className="text-gray-900 font-medium mt-1">{new Date(doctor.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medical Registration No</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.medicalRegistrationNumber}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issuing Council</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.issuingMedicalCouncil}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qualification</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.qualification}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Experience</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.experience} years</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Hospital/Clinic</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.currentHospitalClinic}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Working City</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.currentWorkingCity}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Languages</span>
                          <p className="text-gray-900 font-medium mt-1">{doctor.languagesSpoken?.join(', ')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Registration Type</span>
                          <p className="text-gray-900 font-medium mt-1 capitalize">{doctor.registrationType}</p>
                        </div>
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

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(doctor._id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approve Doctor
                      </button>
                      <button
                        onClick={() => setSelectedDoctor(doctor._id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reject Application
                      </button>
                    </div>

                    {/* Rejection Form */}
                    {selectedDoctor === doctor._id && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h4 className="text-lg font-bold text-red-900">Rejection Reason Required</h4>
                        </div>
                        <textarea
                          placeholder="Please provide a detailed reason for rejection. This will be sent to the doctor via email..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows="4"
                          className="w-full px-4 py-3 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        <div className="flex gap-3">
                          <button 
                            onClick={handleReject} 
                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Submit Rejection
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDoctor(null);
                              setRejectionReason('');
                            }}
                            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
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
