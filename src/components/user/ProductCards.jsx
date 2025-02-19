
import React from 'react';
import { Link } from 'react-router-dom';
import { isValidOffer, getOfferBadgeText, calculateDiscountedPrice, getApplicableOffer } from '../../utils/offerUtils';
import './ProductCards.css';

const ProductCard = ({
  _id, name, description, images, originalPrice, salePrice, isNew, currentOffer, category
}) => {
  const applicableOffer = getApplicableOffer({ currentOffer }, category?.currentOffer);

  const finalPrice = calculateDiscountedPrice(originalPrice, applicableOffer);
  const discountPercentage = applicableOffer ? applicableOffer.discountValue : 0;

  return (
    <Link to={`/product/${_id}`} className="product-card card h-100">
      <div className="product-image-container">
        <img
          src={images[0]?.url || images[0] || "/placeholder.svg?height=300&width=300"}
          alt={name}
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=300&width=300";
          }}
          className="card-img-top product-image"
        />

        {isNew ? (
          <span className="badge bg-success new-badge">New</span>
        ) : applicableOffer && isValidOffer(applicableOffer) && (
          <div className="badge bg-primary offer-badge">
            {getOfferBadgeText(applicableOffer)}
          </div>
        )}
      </div>

      <div className="card-body product-details">
        <h3 className="card-title product-name">{name}</h3>

        <div className="product-price">
          <span className="current-price">₹{finalPrice.toFixed(2)}</span>
          {applicableOffer && isValidOffer(applicableOffer) && (
            <>
              <span className="original-price">₹{originalPrice.toFixed(2)}</span>
              <span className="badge bg-danger discount-tag">
                {applicableOffer.discountValue}% OFF
              </span>
            </>
          )}
        </div>

        {applicableOffer && isValidOffer(applicableOffer) && (
          <p className="card-text offer-name">{applicableOffer.name}</p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
