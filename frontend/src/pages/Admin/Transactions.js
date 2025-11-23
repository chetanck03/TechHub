import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiDollarSign, FiDownload } from 'react-icons/fi';


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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Credits & Transactions</h1>
          <p className="text-secondary-600">Monitor financial transactions and revenue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.totalRevenue}</h3>
                <p className="text-sm text-secondary-600">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.patientCredits}</h3>
                <p className="text-sm text-secondary-600">Patient Credits Purchased</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.doctorCredits}</h3>
                <p className="text-sm text-secondary-600">Doctor Credits Purchased</p>
              </div>
            </div>
          </div>

          <div className="card card-hover">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary-900">{stats.platformFee}</h3>
                <p className="text-sm text-secondary-600">Platform Fee Collected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="credit_purchase">Credit Purchase</option>
                <option value="consultation">Consultation</option>
                <option value="refund">Refund</option>
              </select>

              <select
                value={filters.userType}
                onChange={(e) => setFilters({ ...filters, userType: e.target.value })}
                className="form-input"
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
                className="form-input"
              />

              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                placeholder="End Date"
                className="form-input"
              />

              <button className="btn btn-primary" onClick={exportTransactions}>
                <FiDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="card flex-1 overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto h-full scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-secondary-100">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-secondary-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-secondary-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-secondary-900">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-secondary-600">
                      {transaction._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-secondary-900">{transaction.userId?.name}</div>
                      <div className="text-xs text-secondary-500 capitalize">{transaction.userId?.role}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600 capitalize">
                      {transaction.type?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">{transaction.description}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${
                      transaction.amount > 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      ₹{Math.abs(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-success-100 text-success-700'
                          : transaction.status === 'pending'
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-danger-100 text-danger-700'
                      }`}>
                        {transaction.status}
                      </span>
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

export default Transactions;
