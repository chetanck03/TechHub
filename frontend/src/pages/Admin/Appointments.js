import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';


const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    date: '',
    doctor: '',
    patient: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/admin/appointments', { params: filters });
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to process refund?')) return;
    
    try {
      await api.post(`/admin/appointments/${appointmentId}/refund`);
      toast.success('Refund processed successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to process refund');
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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Appointments Management</h1>
          <p className="text-secondary-600">Monitor and manage all appointments</p>
        </div>

        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>

              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="card flex-1 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto h-full scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Doctor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Fee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-secondary-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-secondary-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {appointment.slotId?.startTime} - {appointment.slotId?.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                      {appointment.patientId?.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                      Dr. {appointment.doctorId?.userId?.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-success-600">
                      ₹{appointment.consultationFee}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'scheduled' 
                          ? 'bg-primary-100 text-primary-700'
                          : appointment.status === 'completed'
                            ? 'bg-success-100 text-success-700'
                            : appointment.status === 'cancelled'
                              ? 'bg-danger-100 text-danger-700'
                              : 'bg-warning-100 text-warning-700'
                      }`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {appointment.status === 'cancelled' && !appointment.refunded && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleRefund(appointment._id)}
                        >
                          Process Refund
                        </button>
                      )}
                      {appointment.refunded && (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                          Refunded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
