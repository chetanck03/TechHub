import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiUsers, FiCalendar, FiCreditCard, FiMapPin } from 'react-icons/fi';
import './Patient.css';

const PatientDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, creditsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/users/credits')
      ]);
      setCategories(categoriesRes.data);
      setCredits(creditsRes.data.credits);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome to Telehealth</h1>
          <p>Find and consult with the best doctors</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <FiCreditCard className="stat-icon" />
            <div>
              <h3>{credits}</h3>
              <p>Available Credits</p>
            </div>
          </div>
          <Link to="/doctors" className="stat-card clickable">
            <FiUsers className="stat-icon" />
            <div>
              <h3>Browse</h3>
              <p>Find Doctors</p>
            </div>
          </Link>
          <Link to="/consultations" className="stat-card clickable">
            <FiCalendar className="stat-icon" />
            <div>
              <h3>View</h3>
              <p>My Appointments</p>
            </div>
          </Link>
        </div>

        <div className="section">
          <h2>Browse by Specialization</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/doctors?category=${category._id}`}
                className="category-card"
              >
                <span className="category-icon">{category.icon}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
