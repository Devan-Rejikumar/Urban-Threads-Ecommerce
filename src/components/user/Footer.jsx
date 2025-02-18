import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row">
          {/* Exclusive Column */}
          <div className="col-md-3 mb-4">
            <h5 className="footer-heading">Exclusive</h5>
            <div className="subscribe-section">
              <p>Subscribe</p>
              <p className="offer-text">Get 10% off your first order</p>
              <div className="email-input">
                <input type="email" placeholder="Enter your email" />
                <button type="submit" className="submit-btn">
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Support Column */}
          <div className="col-md-3 mb-4">
            <h5 className="footer-heading">Support</h5>
            <p className="address">Urban Threads, Thread House<br />DH 1515, India.</p>
            <p>urbanThreads@gmail.com</p>
            <p>+91-95622-09682</p>
          </div>

          {/* Account Column */}
          <div className="col-md-2 mb-4">
            <h5 className="footer-heading">Account</h5>
            <ul className="footer-links">
              <li><Link to="/my-account">My Account</Link></li>
              <li><Link to="/login">Login / Register</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/shop">Shop</Link></li>
            </ul>
          </div>

          {/* Quick Link Column */}
          <div className="col-md-2 mb-4">
            <h5 className="footer-heading">Quick Link</h5>
            <ul className="footer-links">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms Of Use</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Download App Column */}
          <div className="col-md-2 mb-4">
            <h5 className="footer-heading">Download App</h5>
            <p className="app-text">Save $3 with App New User Only</p>
            <div className="qr-section">
              <div className="qr-code">
                <img src="/assets/QR Scan.jpg" alt="QR Code" />
              </div>
              <div className="app-stores">
                <a href="#" className="store-link">
                  <img src="/assets/google play.jpg" alt="Google Play" />
                </a>
                <a href="#" className="store-link">
                  <img src="/assets/app-store.png" alt="App Store" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="social-links">
          <a href="#" className="social-icon"><FaFacebookF /></a>
          <a href="#" className="social-icon"><FaTwitter /></a>
          <a href="#" className="social-icon"><FaInstagram /></a>
          <a href="#" className="social-icon"><FaLinkedinIn /></a>
        </div>

        {/* Copyright */}
        <div className="copyright">
          <p>© Copyright Rimel 2023. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

