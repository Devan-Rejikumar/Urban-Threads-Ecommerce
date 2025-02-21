import React from 'react';
import { Link } from 'react-router-dom';
import './AdminBreadcrumbs.css';

const AdminBreadcrumbs = ({ additionalCrumb }) => {
  return (
    <nav className="breadcrumb">
      <Link to="/admin-dashboard">Dashboard</Link>
      <span className="separator">/</span>
      <Link to="/admin-dashboard/users">User</Link>
      {additionalCrumb && (
        <>
          <span className="separator">/</span>
          <span className="current">{additionalCrumb}</span>
        </>
      )}
    </nav>
  );
};

export default AdminBreadcrumbs;

