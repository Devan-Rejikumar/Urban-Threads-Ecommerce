import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ _id, name, description, images, originalPrice, salePrice, isNew }) => {
  return (
    <Link to={`/product/${_id}`} className="product-card">
      <div className="product-image">
        <img 
          src={images[0] || "/placeholder.svg?height=300&width=300"} 
          alt={name}
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=300&width=300";
          }}
        />
        {isNew && <span className="new-badge">New</span>}
      </div>
      <div className="product-details">
        <h3 className="product-name">{name}</h3>
        {/* <p className="product-description">{description}</p> */}
        <div className="product-price">
          {salePrice ? (
            <>
              <span className="sale-price">${salePrice}</span>
              {/* <span className="original-price">${originalPrice}</span> */}
            </>
          ) : (
            <span className="regular-price">${originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;