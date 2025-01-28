import React, { useState } from 'react';
import { Search, User, Heart, UserCircle, MapPin, Package, Edit, XCircle, Lock, Menu, Wallet } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { userLogout } from '/src/redux/slices/userAuthSlice.js';
import axios from 'axios';
import './Header.css';
import AdvancedSearch from './AdvancedSearch';
import MiniCart from './MiniCart';  // Make sure the path matches your project structure

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(state => state.userAuth);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');

      const response = await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });

      if (response.status === 200) {
        dispatch(userLogout());
        navigate('/', { replace: true });
      } else {
        console.error('Logout failed:', response);
      }
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(userLogout());
      navigate('/', { replace: true });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header-container">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <a href="/" className="brand-logo">
              <img src="/assets/urbn.jpg" alt="Logo" />
            </a>

            <ul className="nav-categories">
              <li><a href="/">HOME</a></li>
              <li><a href="/shop">SHOP</a></li>
              <li><a href="/about">ABOUT</a></li>
              <li><a href="/contact">CONTACT</a></li>
            </ul>
          </div>

          <div className="search-container">
            <AdvancedSearch
              onSearch={(item) => {
                navigate(`/product/${item._id}`);
              }}
            />
          </div>

          <button className="menu-toggle" onClick={toggleMenu}>
            <Menu />
          </button>

          <div className={`nav-actions ${isMenuOpen ? 'open' : ''}`}>
            <div className="nav-item">
              {isAuthenticated ? (
                <div className="profile-dropdown">
                  <a href="/profile" className="nav-link">
                    <User />
                    <span>{user?.firstName || 'Profile'}</span>
                  </a>
                  <div className="dropdown-content">
                    <div className="dropdown-header">
                      <p>Welcome, {user?.firstName}!</p>
                      <p className="dropdown-subtext">Manage your account and orders</p>
                    </div>
                    <div className="dropdown-links">
                      <Link to="/profile/details">
                        <UserCircle className="dropdown-icon" />
                        <span>User Details</span>
                      </Link>
                      <Link to="/profile/address">
                        <MapPin className="dropdown-icon" />
                        <span>Address</span>
                      </Link>
                      <Link to="/profile/orders">
                        <Package className="dropdown-icon" />
                        <span>Orders</span>
                      </Link>
                      <Link to="/profile/wallet">
                        <Wallet className="dropdown-icon" />
                        <span>Wallet</span>
                      </Link>
                      <Link to="/profile/cancel-orders">
                        <XCircle className="dropdown-icon" />
                        <span>Cancel Orders</span>
                      </Link>
                      <Link to="/profile/change-password">
                        <Lock className="dropdown-icon" />
                        <span>Change Password</span>
                      </Link>
                    </div>
                    <div className="dropdown-buttons">
                      <button
                        onClick={handleLogout}
                        className="auth-button"
                      >
                        LOGOUT
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-dropdown">
                  <a href="/login" className="nav-link">
                    <User />
                    <span>Profile</span>
                  </a>
                  <div className="dropdown-content">
                    <div className="dropdown-header">
                      <p>Welcome</p>
                      <p className="dropdown-subtext">To access account and manage orders</p>
                    </div>
                    <div className="dropdown-buttons">
                      <a href="/login" className="auth-button">
                        LOGIN / SIGNUP
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="nav-item">
              <a href="/wishlist" className="nav-link">
                <Heart />
                <span>Wishlist</span>
              </a>
            </div>
            <div className="nav-item">
              <MiniCart />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;