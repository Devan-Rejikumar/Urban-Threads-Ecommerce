export const isValidOffer = (offer) => {
  if (!offer) return false;
  return offer.discountValue > 0 && offer.discountValue <= 100;
};

export const getApplicableOffer = (product, categoryOffer) => {
  const productOffer = product?.currentOffer;
  
  if (!isValidOffer(productOffer) && !isValidOffer(categoryOffer)) {
    return null;
  }

  if (!isValidOffer(productOffer)) return categoryOffer;
  if (!isValidOffer(categoryOffer)) return productOffer;
  
  return productOffer.discountValue >= categoryOffer.discountValue ? productOffer : categoryOffer;
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