import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiUsers, FiCalendar, FiDollarSign, FiClock, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Admin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalBookings: 0,
    todayAppointments: 0,
    pendingApprovals: 0,
    revenue: 0,
    pendingComplaints: 0,
    activeDoctors: 0,
    refundRequests: 0
  });
  const [chartData, setChartData] = useState({
    consultations: { labels: [], data: [] },
    credits: { labels: [], data: [] },
    users: { labels: [], data: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const consultationsChartData = {
    labels: chartData.consultations.labels,
    datasets: [{
      label: 'Daily Consultations',
      data: chartData.consultations.data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const creditsChartData = {
    labels: chartData.credits.labels,
    datasets: [{
      label: 'Credits Purchased',
      data: chartData.credits.data,
      backgroundColor: 'rgba(16, 185, 129, 0.6)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 1
    }]
  };

  const usersChartData = {
    labels: chartData.users.labels,
    datasets: [{
      label: 'New Users',
      data: chartData.users.data,
      borderColor: 'rgb(245, 158, 11)',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4
    }]
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <FiUsers className="stat-icon" style={{ color: '#10b981' }} />
            <div>
              <h3>{stats.totalPatients}</h3>
              <p>Total Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <FiUsers className="stat-icon" style={{ color: '#3b82f6' }} />
            <div>
              <h3>{stats.totalDoctors}</h3>
              <p>Total Doctors</p>
            </div>
          </div>

          <div className="stat-card">
            <FiClock className="stat-icon" style={{ color: '#ef4444' }} />
            <div>
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Verifications</p>
            </div>
          </div>

          <div className="stat-card">
            <FiCalendar className="stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <h3>{stats.todayAppointments}</h3>
              <p>Today's Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <FiDollarSign className="stat-icon" style={{ color: '#14b8a6' }} />
            <div>
              <h3>₹{stats.revenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <FiAlertCircle className="stat-icon" style={{ color: '#f97316' }} />
            <div>
              <h3>{stats.refundRequests}</h3>
              <p>Refund Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <FiAlertCircle className="stat-icon" style={{ color: '#dc2626' }} />
            <div>
              <h3>{stats.pendingComplaints}</h3>
              <p>Complaints in Queue</p>
            </div>
          </div>

          <div className="stat-card">
            <FiActivity className="stat-icon" style={{ color: '#8b5cf6' }} />
            <div>
              <h3>{stats.activeDoctors}</h3>
              <p>Live Doctors Available</p>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h2>Daily Consultations</h2>
            <Line data={consultationsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="chart-container">
            <h2>Credits Purchased</h2>
            <Bar data={creditsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>

          <div className="chart-container">
            <h2>New User Growth</h2>
            <Line data={usersChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="section">
          <h2>Recent Transactions</h2>
          {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="transactions-table">
              {stats.recentTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-row">
                  <div>
                    <strong>{transaction.userId?.name}</strong>
                    <p>{transaction.description}</p>
                    <small>{new Date(transaction.createdAt).toLocaleString()}</small>
                  </div>
                  <div className="transaction-amount">
                    ₹{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent transactions</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
