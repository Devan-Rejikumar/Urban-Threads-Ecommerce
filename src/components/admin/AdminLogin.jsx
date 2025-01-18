import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {  adminLoginStart, adminLoginSuccess, adminLoginFailure } from '../../redux/slices/adminAuthSlice';  
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

        localStorage.setItem('adminData', JSON.stringify({
          name: response.data.admin.name,
          email: response.data.admin.email,
          role: 'admin'
        }));

        navigate('/admin-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred during login.';
      dispatch(adminLoginFailure(errorMessage));
      setError(errorMessage);
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
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <button type="button" className="forgot-password">
              Forgot password?
            </button>
          </div>
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

