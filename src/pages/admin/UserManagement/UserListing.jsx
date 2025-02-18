import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './UserListing.css';
import AdminBreadcrumbs from '../UserManagement/AdminBreadcrumbs';
import axios from 'axios';
import Swal from 'sweetalert2';

const UserListing = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // First verify if the admin is authenticated
        const verifyResponse = await axios.get('http://localhost:5000/api/admin/validate-token', {
          withCredentials: true,
        });

        if (!verifyResponse.data.valid) {
          navigate('/admin-login');
          return;
        }

        // If authenticated, fetch users
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          withCredentials: true,
        });

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
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/admin-login');
        } else if (error.message === 'Network Error') {
          setError('Cannot connect to the server. Please make sure the backend server is running.');
        } else {
          setError(`Error fetching users: ${error.message}`);
        }
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleBlockUnblock = async (id, action) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to ${action} this user?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: action === 'block' ? '#d33' : '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: action === 'block' ? 'Yes, block user' : 'Yes, unblock user',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${id}/${action}`,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === id ? { ...user, status: action === 'block' ? 'blocked' : 'active' } : user
          )
        );

        await Swal.fire({
          title: 'Success!',
          text: `User has been ${action}ed successfully`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        await Swal.fire({
          title: 'Session Expired',
          text: 'Your session has expired. Please login again.',
          icon: 'warning',
          confirmButtonColor: '#3085d6'
        });
        navigate('/admin-login');
      } else {
        await Swal.fire({
          title: 'Error!',
          text: `Failed to ${action} user: ${error.response?.data?.message || error.message}`,
          icon: 'error',
          confirmButtonColor: '#d33'
        });
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

      {/* Add search bar */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text">
            <Search size={20} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {filteredUsers.length > 0 ? (
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
            {filteredUsers.map((user) => (
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