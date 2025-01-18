import React from 'react';
import { Link } from 'react-router-dom';
import './AdminBreadcrumbs.css';

const AdminBreadcrumbs = ({ additionalCrumb }) => {
  return (
    <nav className="breadcrumb">
      <Link to="/dashboard">Dashboard</Link>
      <span className="separator">/</span>
      <Link to="/categories">Products</Link>
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

