import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserListing.css';
import AdminBreadcrumbs from '../UserManagement/AdminBreadcrumbs';
import axios from 'axios';

const UserListing = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        console.log('1111111111111111')
        const response = await axios.get('http://localhost:5000/api/admin/users',{
          withCredentials : true,
        });
        console.log('asdfghjklqwertyuio',response)
        if (Array.isArray(response.data)) {
          
          setUsers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          setError('Invalid response format. Expected an array of users.');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error.message === 'Network Error') {
          setError('Cannot connect to the server. Please make sure the backend server is running.');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('adminData');
          navigate('/admin-login');
        } else {
          setError(`Error fetching users: ${error.message}`);
        }
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const adminData = localStorage.getItem('adminData');
    if (!adminData) {
      navigate('/admin-login');
      return;
    }

    fetchUsers();
  }, []);

  const handleBlockUnblock = async (id, action) => {
    const confirmAction = window.confirm(`Are you sure you want to ${action} this user?`);
    if (!confirmAction) return;
  
    try {

      await axios.put(`http://localhost:5000/api/admin/users/${id}/${action}`);
  
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, status: action === 'block' ? 'blocked' : 'active' } : user
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      if (error.response?.status === 401) {
     
        localStorage.removeItem('adminData');
        navigate('/admin-login');
      } else {
        setError(`Error ${action}ing user: ${error.message}`);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-listing">
      <header>
        <h1>User Management</h1>
        <AdminBreadcrumbs />
      </header>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {users.length > 0 ? (
        <table>
          <caption>User Listing</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.firstName}</td>
                <td>{user.email}</td>
                <td>{user.status}</td>
                <td>
                  <button 
                    onClick={() => handleBlockUnblock(user._id, user.status === 'blocked' ? 'unblock' : 'block')}
                    className={user.status === 'blocked' ? 'unblock-btn' : 'block-btn'}
                  >
                    {user.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-users">No users found.</p>
      )}
    </div>
  );
};

export default UserListing;