export const isValidOffer = (offer) => {
  if (!offer) return false;
  return offer.discountValue > 0 && offer.discountValue <= 100;
};

export const getApplicableOffer = (productOffer, categoryOffer) => {
  // Check if product has a valid offer (whether it's an ID or object)
  if (productOffer && typeof productOffer === 'object' && isValidOffer(productOffer)) {
    return productOffer;
  }
  
  // If no valid product offer, check category offer
  if (categoryOffer && isValidOffer(categoryOffer)) {
    return categoryOffer;
  }
  
  return null;
};
export const calculateDiscountedPrice = (originalPrice, offer) => {
  if (!isValidOffer(offer)) return originalPrice;
  const discount = (originalPrice * offer.discountValue) / 100;
  return Math.round(Math.max(originalPrice - discount, 0));
};

export const getOfferBadgeText = (offer) => {
  if (!isValidOffer(offer)) return '';
  return `${offer.discountValue}% OFF`;
};

export const calculateDiscountPercentage = (originalPrice, finalPrice) => {
  if (originalPrice <= 0 || finalPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};