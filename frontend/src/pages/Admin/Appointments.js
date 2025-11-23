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

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Appointments Management</h1>

        <div className="filters-section">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
          />
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {new Date(appointment.date).toLocaleDateString()}<br />
                    {appointment.slotId?.startTime} - {appointment.slotId?.endTime}
                  </td>
                  <td>{appointment.patientId?.name}</td>
                  <td>{appointment.doctorId?.userId?.name}</td>
                  <td>₹{appointment.consultationFee}</td>
                  <td>
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {appointment.status === 'cancelled' && !appointment.refunded && (
                      <button
                        className="btn-small btn-warning"
                        onClick={() => handleRefund(appointment._id)}
                      >
                        Process Refund
                      </button>
                    )}
                    {appointment.refunded && (
                      <span className="text-success">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
