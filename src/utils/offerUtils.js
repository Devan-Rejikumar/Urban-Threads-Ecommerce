export const calculateDiscountedPrice = (originalPrice, offer) => {
    if (!offer || !isValidOffer(offer)) {
        return originalPrice;
    }

    let discountAmount = 0;
    if (offer.discountType === 'percentage') {
        discountAmount = (originalPrice * offer.discountValue) / 100;
    } else {
        discountAmount = offer.discountValue;
    }


    if (offer.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, offer.maxDiscountAmount);
    }

    return Math.max(originalPrice - discountAmount, 0);
};


export const isValidOffer = (offer) => {
    if (!offer || !offer.isActive) return false;

    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    return now >= startDate && now <= endDate;
};


export const getBestOffer = (product, category) => {
    const productOffer = product?.currentOffer;
    const categoryOffer = category?.currentOffer;

    if (!productOffer && !categoryOffer) return null;
    if (!productOffer) return isValidOffer(categoryOffer) ? categoryOffer : null;
    if (!categoryOffer) return isValidOffer(productOffer) ? productOffer : null;

   
    const priceWithProductOffer = calculateDiscountedPrice(product.salePrice, productOffer);
    const priceWithCategoryOffer = calculateDiscountedPrice(product.salePrice, categoryOffer);

    return priceWithProductOffer <= priceWithCategoryOffer ? productOffer : categoryOffer;
};


export const getOfferBadgeText = (offer) => {
    if (!isValidOffer(offer)) return '';

    if (offer.discountType === 'percentage') {
        return `${offer.discountValue}% OFF`;
    }
    return `₹${offer.discountValue} OFF`;
};

export const getOfferStatus = (offer) => {
    if (!offer) return 'no-offer';
    if (!offer.isActive) return 'inactive';

    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'expired';
    return 'active';
};