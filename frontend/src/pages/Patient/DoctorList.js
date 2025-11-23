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
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Find Doctors</h1>
          <p className="text-secondary-600">Browse and connect with qualified healthcare professionals</p>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="form-input"
                >
                  <option value="">All Specializations</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Min Experience (years)</label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  value={filters.minExperience}
                  onChange={(e) => setFilters({ ...filters, minExperience: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Fee (credits)</label>
                <input
                  type="number"
                  placeholder="e.g., 15"
                  value={filters.maxFee}
                  onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="form-input"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-secondary-600">Loading doctors...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <p className="text-secondary-500 text-lg">No doctors found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="card card-hover">
                <div className="card-body">
                  <div className="flex items-start gap-4 mb-4">
                    {doctor.profilePhoto ? (
                      <img 
                        src={`${process.env.REACT_APP_API_URL}/${doctor.profilePhoto}`} 
                        alt={doctor.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-200" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600 border-2 border-primary-200">
                        {doctor.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary-900">Dr. {doctor.name}</h3>
                      <p className="text-primary-600 font-medium">{doctor.specialization?.name}</p>
                      <p className="text-sm text-secondary-500">{doctor.qualification}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Experience:</span>
                      <span className="font-medium text-secondary-900">{doctor.experience} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Hospital:</span>
                      <span className="font-medium text-secondary-900 text-right">{doctor.currentHospitalClinic}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">City:</span>
                      <span className="font-medium text-secondary-900">{doctor.currentWorkingCity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-600">Languages:</span>
                      <span className="font-medium text-secondary-900 text-right">{doctor.languagesSpoken?.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1">
                      <FiStar className="w-4 h-4 text-warning-500" />
                      <span className="font-medium text-secondary-900">
                        {doctor.rating?.toFixed(1) || 'New'}
                      </span>
                      <span className="text-sm text-secondary-500">
                        ({doctor.totalRatings || 0} reviews)
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success-600">{doctor.consultationFee?.video} cr</div>
                      <div className="text-xs text-secondary-500">Video Fee</div>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {doctor.consultationModes?.video && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        📹 Video
                      </span>
                    )}
                    {doctor.consultationModes?.physical && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                        🏥 Physical
                      </span>
                    )}
                  </div>

                  <Link to={`/doctors/${doctor._id}`} className="block">
                    <button className="btn btn-primary w-full">
                      View Profile & Book
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorList;
