import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Heart, ArrowLeft, User, Stethoscope } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register(formData);
      toast.success('Registration successful! Check your email for OTP');
      navigate('/verify-otp', { state: { userId: response.userId, email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <Heart className="auth-logo-icon" />
          <h2>Telehealth</h2>
        </div>

        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our telehealth platform today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a strong password (min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label>I want to register as</label>
            <div className="role-selector">
              <div 
                className={`role-option ${formData.role === 'patient' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'patient' })}
              >
                <User className="role-icon" />
                <div className="role-info">
                  <h4>Patient</h4>
                  <p>Book consultations</p>
                </div>
              </div>
              <div 
                className={`role-option ${formData.role === 'doctor' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'doctor' })}
              >
                <Stethoscope className="role-icon" />
                <div className="role-info">
                  <h4>Doctor</h4>
                  <p>Provide healthcare</p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
