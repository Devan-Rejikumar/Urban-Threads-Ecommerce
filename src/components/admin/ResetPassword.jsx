import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Reusing the same CSS

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/forgot-password', 
        { email },
        { withCredentials: true }
      );
      
      setSuccessMessage(response.data.message);
      setStep(2); // Move to OTP verification step
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setStep(3); // Move to password reset step
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/admin/reset-password', {
        email,
        otp,
        newPassword
      });

      setSuccessMessage('Password reset successful!');
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background dots (reused from AdminLogin) */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="background-dot"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 10 + 10}s`
          }}
        />
      ))}
      
      <div className="login-card">
        <div className="card-header">
          <div className="logo">R</div>
          <h1>Reset Password</h1>
          <p>{
            step === 1 ? 'Enter your email to receive OTP' :
            step === 2 ? 'Enter the OTP sent to your email' :
            'Enter your new password'
          }</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="back-button"
                onClick={() => navigate('/admin-login')}
              >
                Back to Login
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="back-button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={otp.length !== 6}
              >
                Verify OTP
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="login-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="back-button"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;