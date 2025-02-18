import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Check if the current path starts with /admin-dashboard
    if (location.pathname.startsWith('/admin-dashboard')) {
      navigate('/admin-dashboard');
    }
  }, [location, navigate]);

  // For admin routes, return null while redirecting
  if (location.pathname.startsWith('/admin-dashboard')) {
    return null;
  }

  // Regular 404 page for user routes
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="fs-3">
          <span className="text-danger">Oops!</span> Page not found.
        </p>
        <p className="lead">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
};

export default PageNotFound;