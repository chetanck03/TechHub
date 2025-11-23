import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiUsers, FiCalendar, FiDollarSign, FiClock, FiAlertCircle, FiActivity } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';


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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Admin Dashboard</h1>
          <p className="text-secondary-600">Monitor and manage your telehealth platform</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card card-hover">
              <div className="card-body flex items-center gap-4">
                <div className="p-3 bg-success-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-success-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats.totalPatients}</h3>
                  <p className="text-sm text-secondary-600">Total Patients</p>
                </div>
              </div>
            </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.totalDoctors}</h3>
                <p className="text-sm text-secondary-600">Total Doctors</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-danger-100 rounded-lg">
                <FiClock className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.pendingApprovals}</h3>
                <p className="text-sm text-secondary-600">Pending Verifications</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <FiCalendar className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.todayAppointments}</h3>
                <p className="text-sm text-secondary-600">Today's Appointments</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.revenue}</h3>
                <p className="text-sm text-secondary-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.refundRequests}</h3>
                <p className="text-sm text-secondary-600">Refund Requests</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-danger-100 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.pendingComplaints}</h3>
                <p className="text-sm text-secondary-600">Complaints in Queue</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiActivity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.activeDoctors}</h3>
                <p className="text-sm text-secondary-600">Live Doctors Available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-secondary-900">Daily Consultations</h2>
            </div>
            <div className="card-body">
              <div className="h-64">
                <Line data={consultationsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-secondary-900">Credits Purchased</h2>
            </div>
            <div className="card-body">
              <div className="h-64">
                <Bar data={creditsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-secondary-900">New User Growth</h2>
            </div>
            <div className="card-body">
              <div className="h-64">
                <Line data={usersChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-secondary-900">Recent Transactions</h2>
          </div>
          <div className="card-body">
            {stats.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                    <div className="flex-1">
                      <h4 className="font-semibold text-secondary-900">{transaction.userId?.name}</h4>
                      <p className="text-secondary-600 text-sm">{transaction.description}</p>
                      <p className="text-xs text-secondary-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-success-600"> $ {transaction.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary-500">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
