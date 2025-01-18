import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './userBreadcrumbs.css';

const Breadcrumbs = ({ categoryName, productName }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const pathSegments = location.pathname.split('/').filter(segment => segment);

  const getBreadcrumbs = () => {
    // Start with Home for user routes, Dashboard for admin routes
    const breadcrumbs = [{ name: 'Home', path: '/' }];

    // For user routes, handle category and product paths
    if (!isAdmin) {
      // If we're on a product page and have category info
      if (productName && categoryName) {
        breadcrumbs.push({
          name: categoryName,
          path: `/category/${categoryName.toLowerCase()}`
        });
        breadcrumbs.push({
          name: productName,
          path: location.pathname // Keep current path for product
        });
      }
      // If we're just on a category page
      else if (pathSegments.includes('category')) {
        const categoryPath = `/category/${pathSegments[pathSegments.indexOf('category') + 1]}`;
        breadcrumbs.push({
          name: categoryName || 'Category',
          path: categoryPath
        });
      }
      // If we're on a product page without category info
      else if (pathSegments.includes('product')) {
        breadcrumbs.push({
          name: productName || 'Product',
          path: location.pathname
        });
      }
    } 
    // For admin routes, handle admin sections
    else {
      breadcrumbs[0] = { name: 'Dashboard', path: '/admin-dashboard' };
      let currentPath = '/admin-dashboard';

      pathSegments.forEach((segment) => {
        if (segment === 'admin-dashboard') return;

        currentPath += `/${segment}`;
        
        switch(segment) {
          case 'users':
            breadcrumbs.push({ name: 'User Management', path: currentPath });
            break;
          case 'products':
            breadcrumbs.push({ name: 'Product Management', path: currentPath });
            break;
          case 'categories':
            breadcrumbs.push({ name: 'Category Management', path: currentPath });
            break;
          case 'add':
            breadcrumbs.push({ name: 'Add New', path: currentPath });
            break;
          case 'edit':
            breadcrumbs.push({ name: 'Edit', path: currentPath });
            break;
          default:
            break;
        }
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className={`breadcrumbs ${isAdmin ? 'admin' : ''}`}>
      <div className="breadcrumbs-container">
        <div className="breadcrumbs-list">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="separator">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-item current">{crumb.name}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-item">
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;