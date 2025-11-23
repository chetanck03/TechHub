import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiCalendar, FiCreditCard, FiUsers, FiVideo, FiMessageCircle, FiAlertCircle } from 'react-icons/fi';


const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    consultations: 0,
    credits: 0,
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if doctor profile exists
      let profileExists = false;
      try {
        const profileRes = await api.get('/doctors/me/profile');
        setDoctorProfile(profileRes.data);
        profileExists = true;
      } catch (error) {
        if (error.response?.status === 404) {
          setProfileError(true);
        }
      }

      // Only fetch other data if profile exists
      if (profileExists) {
        const [consultationsRes, creditsRes] = await Promise.all([
          api.get('/consultations/my-consultations'),
          api.get('/users/credits')
        ]);
        
        const upcoming = consultationsRes.data.filter(c => c.status === 'scheduled');
        
        setStats({
          consultations: consultationsRes.data.length,
          credits: creditsRes.data.credits,
          upcomingAppointments: upcoming
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Doctor Dashboard</h1>
          <p className="text-secondary-600">Manage your consultations and patient care</p>
        </div>

        {/* Show Complete Registration Alert if profile doesn't exist */}
        {profileError && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-6 rounded-xl mb-6 flex items-center gap-4 shadow-lg">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <FiAlertCircle size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Complete Your Doctor Registration
              </h3>
              <p className="opacity-90">
                You need to complete your doctor profile with all required documents before you can start practicing on our platform.
              </p>
            </div>
            <button 
              onClick={() => navigate('/doctor/register')}
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 whitespace-nowrap"
            >
              Complete Registration →
            </button>
          </div>
        )}

        {/* Show approval pending message if profile exists but not approved */}
        {doctorProfile && !doctorProfile.isApproved && (
          <div className="bg-gradient-to-r from-warning-500 to-danger-500 text-white p-6 rounded-xl mb-6 flex items-center gap-4 shadow-lg">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <FiAlertCircle size={32} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Registration Pending Approval
              </h3>
              <p className="opacity-90">
                Your doctor registration is under review by our admin team. You will receive an email once approved.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.consultations}</h3>
                <p className="text-sm text-secondary-600">Total Consultations</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <FiCreditCard className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.credits}</h3>
                <p className="text-sm text-secondary-600">Available Credits</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.upcomingAppointments.length}</h3>
                <p className="text-sm text-secondary-600">Upcoming Appointments</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-secondary-900">Upcoming Appointments</h2>
          </div>
          <div className="card-body">
            {stats.upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-secondary-500">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200 hover:shadow-md transition-shadow duration-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 mb-1">{appointment.patientId?.name}</h3>
                      <p className="text-secondary-600 text-sm mb-2">{new Date(appointment.scheduledAt).toLocaleString()}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.type === 'online' 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'bg-success-100 text-success-700'
                      }`}>
                        {appointment.type}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      {appointment.type === 'online' && (
                        <Link to={`/video-call/${appointment._id}`}>
                          <button className="btn btn-primary btn-sm">
                            <FiVideo className="w-4 h-4" />
                            Join Call
                          </button>
                        </Link>
                      )}
                      {appointment.videoCallCompleted && (
                        <Link to={`/chat/${appointment._id}`}>
                          <button className="btn btn-secondary btn-sm">
                            <FiMessageCircle className="w-4 h-4" />
                            Chat
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
