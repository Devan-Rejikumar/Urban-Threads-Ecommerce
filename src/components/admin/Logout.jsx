import React from 'react';
import axios from 'axios';
import { LogOut } from 'lucide-react';

const LogoutButton = ({ className = '', onLogoutSuccess = () => {} }) => {
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
    
        localStorage.clear();
        

        onLogoutSuccess();
        

        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${className}`}
    >
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;





