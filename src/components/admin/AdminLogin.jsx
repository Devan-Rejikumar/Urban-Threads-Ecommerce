import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { adminLoginStart, adminLoginSuccess, adminLoginFailure } from '../../redux/slices/adminAuthSlice';
import { Toast, ToastContainer } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'success'
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const showNotification = (message, variant) => {
    setToast({
      show: true,
      message,
      variant
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(adminLoginStart());

    try {
      const response = await axios.post('http://localhost:5000/api/admin/adminLogin', {
        email,
        password,
      }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        dispatch(adminLoginSuccess({
          id: response.data.admin.id,
          name: response.data.admin.name,
          email: response.data.admin.email,
          role: 'admin'
        }));
        showNotification('Login successful!', 'success');
        navigate('/admin-dashboard', { replace: true });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login.';
      dispatch(adminLoginFailure(errorMessage));
      showNotification(errorMessage, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showNotification('Please enter your email address', 'danger');
      return;
    }
    
    setIsResetting(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/admin/forgot-password', 
        { email: resetEmail },
        { withCredentials: true }
      );
      
      showNotification(response.data.message, 'success');
      setShowOtpForm(true);
      setShowForgotPassword(false);
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to send reset link', 'danger');
    } finally {
      setIsResetting(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    if (!otp) {
      showNotification('Please enter the OTP', 'danger');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/admin/verify-otp', {
        email: resetEmail,
        otp
      });

      if (response.data.success) {
        setShowNewPasswordForm(true);
        setShowOtpForm(false);
        showNotification('OTP verified successfully', 'success');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Invalid OTP', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'danger');
      return;
    }

    if (newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long', 'danger');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/admin/reset-password', {
        email: resetEmail,
        otp,
        newPassword
      });

      if (response.data.success) {
        showNotification('Password reset successful! Please login with your new password.', 'success');
        setShowNewPasswordForm(false);
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setResetEmail('');
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to reset password', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="login-container">
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
          <h1>Admin Sign In</h1>
          <p>Sign in and start managing your candidates!</p>
        </div>

        {!showForgotPassword && !showOtpForm && !showNewPasswordForm ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-options">
              <button 
                type="button" 
                className="forgot-password"
                onClick={() => setShowForgotPassword(true)}
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : showForgotPassword && !showOtpForm && !showNewPasswordForm ? (
          <form onSubmit={handleForgotPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="resetEmail">Email Address</label>
              <input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={isResetting}
              />
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="back-button"
                onClick={() => setShowForgotPassword(false)}
                disabled={isResetting}
              >
                Back to Login
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={isResetting}
              >
                {isResetting ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : showOtpForm && !showNewPasswordForm ? (
          <form onSubmit={handleOtpVerification} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="back-button"
                onClick={() => {
                  setShowOtpForm(false);
                  setShowForgotPassword(true);
                }}
                disabled={isLoading}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        ) : (
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
                disabled={isLoading}
                minLength="6"
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
                disabled={isLoading}
                minLength="6"
              />
            </div>
            
            <div className="form-buttons">
              <button 
                type="button" 
                className="back-button"
                onClick={() => {
                  setShowNewPasswordForm(false);
                  setShowOtpForm(true);
                }}
                disabled={isLoading}
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

      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.variant === 'success' ? 'Success' : 'Error'}
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'success' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AdminLogin;