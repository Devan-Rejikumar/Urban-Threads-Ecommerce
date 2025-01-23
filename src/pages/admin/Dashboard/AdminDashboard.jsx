
import React, { Fragment } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminLogout as logout } from '../../../redux/slices/adminAuthSlice';
import './AdminDashboard.css';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/adminLogout', {}, {
        withCredentials: true,
      });

      if (response.status === 200) {
        dispatch(logout());
        navigate('/admin-login', { replace: true });

      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }

  };

  return (
    <Fragment>
      <div className='heading'>
        <h1 className='heading-title'>Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
      <div className="admin-dashboard">
        <div className="sidebar">
          <nav>
            <ul>
              <li>
                <Link to="products" className="sidebar-link">Product</Link>
              </li>
              <li>
                <Link to="categories" className="sidebar-link">Category</Link>
              </li>
              <li>
                <Link to="users" className="sidebar-link">User Listing</Link>
              </li>
              <li>
                <Link to="orders" className="sidebar-link">Order Management</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </Fragment>
  );

};

export default AdminDashboard;