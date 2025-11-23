import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { FiStar } from 'react-icons/fi';


const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    minExperience: '',
    maxFee: '',
    minRating: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchCategories();
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minExperience) params.append('minExperience', filters.minExperience);
      if (filters.maxFee) params.append('maxFee', filters.maxFee);
      if (filters.minRating) params.append('minRating', filters.minRating);

      const response = await api.get(`/doctors?${params.toString()}`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="dashboard">
        <h1>Find Doctors</h1>

        <div className="filters">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Specialization</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Specializations</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Min Experience (years)</label>
              <input
                type="number"
                placeholder="e.g., 5"
                value={filters.minExperience}
                onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Max Fee (credits)</label>
              <input
                type="number"
                placeholder="e.g., 15"
                value={filters.maxFee}
                onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
              />
            </div>

            <div className="filter-group">
              <label>Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="loading">No doctors found</div>
        ) : (
          <div className="doctor-grid">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="doctor-card">
                <div className="doctor-header">
                  {doctor.profilePhoto ? (
                    <img src={`${process.env.REACT_APP_API_URL}/${doctor.profilePhoto}`} alt={doctor.name} className="doctor-avatar" />
                  ) : (
                    <div className="doctor-avatar">
                      {doctor.name?.charAt(0)}
                    </div>
                  )}
                  <div className="doctor-info">
                    <h3>Dr. {doctor.name}</h3>
                    <p>{doctor.specialization?.name}</p>
                    <small>{doctor.qualification}</small>
                  </div>
                </div>

                <div className="doctor-details">
                  <p><strong>Experience:</strong> {doctor.experience} years</p>
                  <p><strong>Hospital:</strong> {doctor.currentHospitalClinic}</p>
                  <p><strong>City:</strong> {doctor.currentWorkingCity}</p>
                  <p><strong>Languages:</strong> {doctor.languagesSpoken?.join(', ')}</p>
                </div>

                <div className="doctor-stats">
                  <div className="stat">
                    <span className="stat-value">
                      <FiStar style={{ color: '#f59e0b' }} /> {doctor.rating?.toFixed(1) || 'New'}
                    </span>
                    <span className="stat-label">{doctor.totalRatings || 0} reviews</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{doctor.consultationFee?.video} cr</span>
                    <span className="stat-label">Video Fee</span>
                  </div>
                </div>

                <div className="consultation-modes">
                  {doctor.consultationModes?.video && <span className="mode-badge video">📹 Video</span>}
                  {doctor.consultationModes?.physical && <span className="mode-badge physical">🏥 Physical</span>}
                </div>

                <Link to={`/doctors/${doctor._id}`}>
                  <button className="btn-view">View Profile & Book</button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorList;
