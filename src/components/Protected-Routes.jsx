

// import { Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// export const UserRoute = ({ children }) => {
//   const { isAuthenticated: userAuthenticated } = useSelector(state => state.userAuth);
  
//   return userAuthenticated ? children : <Navigate to="/login" />;
// };

// export const AdminRoute = ({ children }) => {
//   const { isAuthenticated: adminAuthenticated } = useSelector(state => state.adminAuth);
  
//   return adminAuthenticated ? <Navigate to="/admin-login" /> : children;
// };

// export const PublicRoute = ({ children }) => {
//   const { isAuthenticated: userAuthenticated } = useSelector(state => state.userAuth);
//   const { isAuthenticated: adminAuthenticated } = useSelector(state => state.adminAuth);
  
//   if (userAuthenticated) return <Navigate to="/" />;
//   if (adminAuthenticated) return <Navigate to="/admin-dashboard" />;
  
//   return children;
// };import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// // Public routes should be accessible if the specific auth type is not present
// export const PublicRoute = ({ children, authType = 'user' }) => {
//   const location = useLocation();
//   const { isAuthenticated: userAuthenticated } = useSelector(state => state.userAuth);
//   const { isAuthenticated: adminAuthenticated } = useSelector(state => state.adminAuth);

//   // For admin login page
//   if (authType === 'admin') {
//     // Allow access to admin login if not admin authenticated
//     // Don't redirect even if user is authenticated
//     return !adminAuthenticated ? children : <Navigate to="/admin-dashboard" replace />;
//   }

//   // For user-related public routes
//   if (authType === 'user') {
//     return !userAuthenticated ? children : <Navigate to="/" replace />;
//   }

//   return children;
// };

// // User routes require user authentication
// export const UserRoute = ({ children }) => {
//   const { isAuthenticated } = useSelector(state => state.userAuth);
//   const location = useLocation();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   return children;
// };

// // Admin routes require admin authentication
// export const AdminRoute = ({ children }) => {
//   const location = useLocation();
//   const { isAuthenticated } = useSelector(state => state.adminAuth);

//   // Add console logs to debug authentication state
//   console.log('Admin Auth State:', { isAuthenticated });
  
//   if (!isAuthenticated) {
//     console.log('Admin not authenticated, redirecting to login');
//     return <Navigate to="/admin-login" state={{ from: location }} replace />;
//   }

//   return children;
// };