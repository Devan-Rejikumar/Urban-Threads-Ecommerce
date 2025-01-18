// export const ProductCard = ({ images, name, price, isNew }) => {
//   return (
//     <div className="product-card">
//       <div className="product-image">
//         <img src={images?.[0]} alt={name} /> 
//         {isNew && <span className="new-tag">New</span>}
//         <div className="hover-overlay">
//           <button className="quick-view-btn">Quick View</button>
//         </div>
//       </div>
//       <h5 className="name-center">{name}</h5>
      
//     </div>
//   );
// };
// ProductCard.jsx
// ProductCard.jsx
// ProductCard.jsximport React, { useState } from "react";
import { useState } from 'react';
import './ProductCard.css';
import { useNavigate } from 'react-router-dom';

export const ProductCard = ({ 
  _id,
  name = '', 
  originalPrice = 0,  
  salePrice,         
  images = [],       
  rating = 0, 
  availability = 'in_stock', 
  isNew = false 
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClick = (e) => {
    e.preventDefault(); 
    console.log('Product clicked:', _id); 
    if (_id) {
      navigate(`/product/${_id}`);
      console.log('Navigating to:', `/product/${_id}`); 
    } else {
      console.log('No product ID available'); 
    }
  };


  const imageUrl = Array.isArray(images) && images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : images[0]?.url)
    : null;

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="product-image-container">
        {availability === 'out_of_stock' && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
        {isNew && (
          <span className="new-badge">New</span>
        )}
        {isLoading && !imageError && (
          <div className="image-loading">Loading...</div>
        )}
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={name} 
            className={`product-image ${isLoading ? 'hidden' : ''}`}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              console.log('Image load error for:', imageUrl);
              setImageError(true);
              setIsLoading(false);
            }} 
          />
        ) : (
          <div className="image-placeholder">No Image Available</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        {rating > 0 && (
          <div className="product-rating">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`star ${i < rating ? 'filled' : ''}`}
              >
                ★★★★★
              </span>
            ))}
            <span className="rating-count">({rating})</span>
          </div>
        )}
        <div className="price-container">
          {salePrice ? (
            <>
              {/* <p className="product-price sale-price">₹{salePrice.toFixed(2)}</p> */}
              {/* <p className="product-price original-price">₹{originalPrice.toFixed(2)}</p> */}
            </>
          ) : (
            <p className="product-price">₹{originalPrice.toFixed(2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};