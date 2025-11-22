import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FiCreditCard } from 'react-icons/fi';
import './Patient.css';

const Credits = () => {
  const [credits, setCredits] = useState(0);
  const [packages, setPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [creditsRes, packagesRes, transactionsRes] = await Promise.all([
        api.get('/users/credits'),
        api.get('/credits/packages'),
        api.get('/credits/transactions')
      ]);
      setCredits(creditsRes.data.credits);
      setPackages(packagesRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg) => {
    try {
      await api.post('/credits/purchase', {
        amount: pkg.amount,
        credits: pkg.credits
      });
      toast.success(`Successfully purchased ${pkg.credits} credits!`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Credit Wallet</h1>

        <div className="credit-balance">
          <FiCreditCard className="credit-icon" />
          <div>
            <h2>{credits}</h2>
            <p>Available Credits</p>
          </div>
        </div>

        <div className="section">
          <h2>Buy Credits</h2>
          <div className="packages-grid">
            {packages.map((pkg, index) => (
              <div key={index} className="package-card">
                <h3>{pkg.credits} Credits</h3>
                <p className="package-price">${pkg.amount}</p>
                <button 
                  onClick={() => handlePurchase(pkg)}
                  className="btn-primary"
                >
                  Purchase
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Transaction History</h2>
          {transactions.length === 0 ? (
            <p>No transactions yet</p>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div>
                    <strong>{transaction.description}</strong>
                    <p>{new Date(transaction.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={transaction.credits > 0 ? 'credit-positive' : 'credit-negative'}>
                    {transaction.credits > 0 ? '+' : ''}{transaction.credits} credits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Credits;
