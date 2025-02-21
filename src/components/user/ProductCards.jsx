import React from 'react';
import { Link } from 'react-router-dom';
import { isValidOffer, getOfferBadgeText, calculateDiscountedPrice, getApplicableOffer } from '../../utils/offerUtils';
import './ProductCards.css';

const ProductCard = ({
  _id,
  name,
  description,
  images,
  originalPrice,
  salePrice,
  isNew,
  currentOffer,
  productCategory,
  productCategoryOffer
}) => {
  console.log('Received offers:', {
    productOffer: currentOffer,
    productCategoryOffer: productCategory?.currentOffer
  });
  
  // Don't modify how product offer is handled since it was working
  const productOfferObject = currentOffer ? { currentOffer } : null;
  
  // Keep the console logs as they were for debugging
  console.log('Product Offer Object:', productOfferObject);
  console.log('Category Offer:', productCategory?.currentOffer);
 
  // Modified to properly handle productCategory offers
  const applicableOffer = getApplicableOffer(
    { currentOffer: typeof currentOffer === 'object' ? currentOffer : null },
    productCategory?.currentOffer
  );
 
  console.log('Applicable Offer:', applicableOffer);
  
  // Calculate final price based on offer if exists
  const basePrice = salePrice || originalPrice;
  console.log('Base Price:', basePrice);
 
  const finalPrice = calculateDiscountedPrice(basePrice, applicableOffer);
  console.log('Final Price:', finalPrice);
  
  // Calculate price difference percentage
  const calculatePriceDifference = () => {
    if (!originalPrice || !salePrice) return null;
    if (originalPrice === salePrice) return null;
   
    const difference = ((originalPrice - salePrice) / originalPrice) * 100;
    return Math.round(difference);
  };
  
  const priceDifferencePercentage = calculatePriceDifference();
  console.log('Price Difference %:', priceDifferencePercentage);
  
  // Determine which discount to show (either from offer or price difference)
  const discountToShow = applicableOffer
    ? applicableOffer.discountValue
    : priceDifferencePercentage;
  
  console.log('Discount to Show:', discountToShow);
  
  // Determine if we should show price comparison
  const showPriceComparison = applicableOffer || (originalPrice && salePrice && originalPrice !== salePrice);
  console.log('Show Price Comparison:', showPriceComparison);
  
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
        ) : showPriceComparison && discountToShow > 0 && (
          <div className="badge bg-primary offer-badge">
            {discountToShow}% OFF
          </div>
        )}
      </div>
      <div className="card-body product-details">
        <h3 className="card-title product-name">{name}</h3>
        <div className="product-price">
          <span className="current-price">
            ₹{finalPrice.toFixed(2)}
          </span>
          {showPriceComparison && (
            <>
              <span className="original-price">
                ₹{originalPrice.toFixed(2)}
              </span>
              <span className="badge bg-danger discount-tag">
                {discountToShow}% OFF
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