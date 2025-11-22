import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiDollarSign, FiDownload } from 'react-icons/fi';
import './Admin.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    patientCredits: 0,
    doctorCredits: 0,
    platformFee: 0
  });
  const [filters, setFilters] = useState({
    type: 'all',
    userType: 'all',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions', { params: filters });
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/transactions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const exportTransactions = async () => {
    try {
      const response = await api.get('/admin/transactions/export', {
        params: filters,
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Transactions exported successfully');
    } catch (error) {
      toast.error('Failed to export transactions');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="admin-page">
        <h1>Credits & Transactions</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <FiDollarSign className="stat-icon" style={{ color: '#10b981' }} />
            <div>
              <h3>₹{stats.totalRevenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <FiDollarSign className="stat-icon" style={{ color: '#3b82f6' }} />
            <div>
              <h3>₹{stats.patientCredits}</h3>
              <p>Patient Credits Purchased</p>
            </div>
          </div>
          <div className="stat-card">
            <FiDollarSign className="stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <h3>₹{stats.doctorCredits}</h3>
              <p>Doctor Credits Purchased</p>
            </div>
          </div>
          <div className="stat-card">
            <FiDollarSign className="stat-icon" style={{ color: '#14b8a6' }} />
            <div>
              <h3>₹{stats.platformFee}</h3>
              <p>Platform Fee Collected</p>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="credit_purchase">Credit Purchase</option>
            <option value="consultation">Consultation</option>
            <option value="refund">Refund</option>
          </select>

          <select
            value={filters.userType}
            onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
          >
            <option value="all">All Users</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="End Date"
          />

          <button className="btn-primary" onClick={exportTransactions}>
            <FiDownload /> Export CSV
          </button>
        </div>

        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.createdAt).toLocaleString()}</td>
                  <td>{transaction._id.slice(-8)}</td>
                  <td>
                    {transaction.userId?.name}<br />
                    <small>{transaction.userId?.role}</small>
                  </td>
                  <td>{transaction.type}</td>
                  <td>{transaction.description}</td>
                  <td className={transaction.amount > 0 ? 'text-success' : 'text-danger'}>
                    ₹{Math.abs(transaction.amount)}
                  </td>
                  <td>
                    <span className={`status-badge ${transaction.status}`}>
                      {transaction.status}
                    </span>
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

export default Transactions;
