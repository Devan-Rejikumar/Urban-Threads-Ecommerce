import React from 'react';

export const NewArrivalCard = ({ name, price, image }) => {
  return (
    <div className="new-arrival-card">
      <div className="image-container">
        <span className="new-tag">New</span>
        <img 
          src={image || "/api/placeholder/400/400"} 
          alt={name}
          onError={(e) => {
            e.target.src = "/api/placeholder/400/400";
          }}
        />
      </div>
      <div className="card-content">
        <h3>{name}</h3>
        <p className="price">₹{price.toFixed(2)}</p>
        <button className="add-to-cart-btn">Add to Cart</button>
      </div>
    </div>
  );
}