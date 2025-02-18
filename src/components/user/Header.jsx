import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Heart, UserCircle, MapPin, Package, Edit, XCircle, Lock, Menu, Wallet } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { userLogout } from '/src/redux/slices/userAuthSlice.js';
import axios from 'axios';
import './Header.css';
import AdvancedSearch from './AdvancedSearch';
import MiniCart from './MiniCart';  

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector(state => state.userAuth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
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
            <div className="nav-item" ref={dropdownRef}>
              {isAuthenticated ? (
                <div className="profile-dropdown">
                  <button 
                    onClick={toggleDropdown}
                    className="nav-link"
                    aria-expanded={isDropdownOpen}
                  >
                    <User />
                    <span>{user?.firstName || 'Profile'}</span>
                  </button>
                  <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                    <div className="dropdown-header">
                      <p>Welcome, {user?.firstName}!</p>
                      <p className="dropdown-subtext">Manage your account and orders</p>
                    </div>
                    <div className="dropdown-links">
                      <Link to="/profile/details" onClick={() => setIsDropdownOpen(false)}>
                        <UserCircle className="dropdown-icon" />
                        <span>User Details</span>
                      </Link>
                      <Link to="/profile/address" onClick={() => setIsDropdownOpen(false)}>
                        <MapPin className="dropdown-icon" />
                        <span>Address</span>
                      </Link>
                      <Link to="/profile/orders" onClick={() => setIsDropdownOpen(false)}>
                        <Package className="dropdown-icon" />
                        <span>Orders</span>
                      </Link>
                      <Link to="/profile/wallet" onClick={() => setIsDropdownOpen(false)}>
                        <Wallet className="dropdown-icon" />
                        <span>Wallet</span>
                      </Link>
                      <Link to="/profile/change-password" onClick={() => setIsDropdownOpen(false)}>
                        <Lock className="dropdown-icon" />
                        <span>Change Password</span>
                      </Link>
                    </div>
                    <div className="dropdown-buttons">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="auth-button"
                      >
                        LOGOUT
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-dropdown">
                  <button 
                    onClick={toggleDropdown}
                    className="nav-link"
                    aria-expanded={isDropdownOpen}
                  >
                    <User />
                    <span>Profile</span>
                  </button>
                  <div className={`dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
                    <div className="dropdown-header">
                      <p>Welcome</p>
                      <p className="dropdown-subtext">To access account and manage orders</p>
                    </div>
                    <div className="dropdown-buttons">
                      <a 
                        href="/login" 
                        className="auth-button"
                        onClick={() => setIsDropdownOpen(false)}
                      >
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