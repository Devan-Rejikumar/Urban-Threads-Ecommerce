import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment);

  // Define static path mappings
  const pathMappings = {
    shop: 'Shop',
    cart: 'Cart',
    checkout: 'Checkout',
    product: 'Product',
    'order-success': 'Order Success',
    profile: 'Profile',
    orders: 'Orders'
  };

  const getDisplayName = (segment) => {
    return pathMappings[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  // Exclude dynamic segments (like product IDs)
  const filteredSegments = pathSegments.filter((segment, index) => {
    // Keep only if it's in pathMappings OR it's not a numeric/alphanumeric segment after "product"
    if (pathMappings[segment]) return true;
    if (pathSegments[index - 1] === 'product') return false; // Ignore the ID after 'product'
    return true;
  });

  if (location.pathname === '/') return null;

  return (
    <div className="container py-3">
      <div className="flex items-center text-sm">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          Home
        </Link>
        {filteredSegments.map((segment, index) => (
          <React.Fragment key={segment}>
            <span className="mx-2 text-gray-400">{'\u203A'}</span>
            {index === filteredSegments.length - 1 ? (
              <span className="text-gray-900">
                {getDisplayName(segment)}
              </span>
            ) : (
              <Link 
                to={`/${filteredSegments.slice(0, index + 1).join('/')}`}
                className="text-gray-600 hover:text-gray-900"
              >
                {getDisplayName(segment)}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs;
