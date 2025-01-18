import React from 'react';
import { Link } from 'react-router-dom';

const AdminBreadcrumbs = ({ additionalCrumb }) => {
  return (
    <nav className="breadcrumb">
      <Link to="/dashboard">Dashboard</Link>
      <span className="separator">/</span>
      <Link to="/categories">Categories</Link>
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

