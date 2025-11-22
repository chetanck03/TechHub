import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Invalid verification link');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOTP(userId, otp);
      toast.success('Account verified successfully!');
      
      // If doctor, redirect to complete registration
      if (user.role === 'doctor') {
        toast.info('Please complete your doctor registration');
        navigate('/doctor/register');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📧 Verify OTP</h1>
          <p>Enter the OTP sent to {email}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>OTP Code</label>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-footer">
          Didn't receive OTP? <a href="#resend">Resend</a>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
