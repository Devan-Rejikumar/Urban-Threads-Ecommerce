export const isValidOffer = (offer) => {
  if (!offer) return false;
  
  const now = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = new Date(offer.endDate);
  
  return offer.isActive && now >= startDate && now <= endDate;
};


export const getApplicableOffer = (product, categoryOffer) => {
  const productOffer = product?.currentOffer;
  
  if (!isValidOffer(productOffer) && !isValidOffer(categoryOffer)) {
    return null;
  }
  

  if (!isValidOffer(productOffer)) return categoryOffer;
  if (!isValidOffer(categoryOffer)) return productOffer;
  

  const getDiscountAmount = (price, offer) => {
    if (offer.discountType === 'percentage') {
      return (price * offer.discountValue) / 100;
    }
    return offer.discountValue;
  };
  

  const samplePrice = 1000;
  const productDiscount = getDiscountAmount(samplePrice, productOffer);
  const categoryDiscount = getDiscountAmount(samplePrice, categoryOffer);
  
  return productDiscount >= categoryDiscount ? productOffer : categoryOffer;
};


export const calculateDiscountedPrice = (originalPrice, offer) => {
  if (!isValidOffer(offer)) return originalPrice;
  
  if (offer.discountType === 'percentage') {
    const discount = (originalPrice * offer.discountValue) / 100;
    return Math.max(originalPrice - discount, 0);
  } else {
    return Math.max(originalPrice - offer.discountValue, 0);
  }
};


export const getOfferBadgeText = (offer) => {
  if (!isValidOffer(offer)) return '';
  
  return offer.discountType === 'percentage'
    ? `${offer.discountValue}% OFF`
    : `₹${offer.discountValue} OFF`;
};

export const calculateDiscountPercentage = (originalPrice, finalPrice) => {
  if (originalPrice <= 0 || finalPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
};