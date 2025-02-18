import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../../components/user/ProductCard';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import './ProductDetails.css';
import Breadcrumbs from '../../components/BreadCrumps';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import Cart from './Cart';
import axiosInstance from '../../utils/axiosInstance';
import { addToWishlist, removeFromWishlist, setWishlist } from '../../redux/slices/whishlistSlice';
import { Heart } from 'lucide-react';

const ProductDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.userAuth);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const { cartItems } = useSelector(state => state.cart?.items || []);
  const wishlistItems = useSelector(state => state.wishlist.items);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get(
          `http://localhost:5000/api/products/${productId}`,
          { withCredentials: true }
        );
        setProduct(productResponse.data);

        const allProductsResponse = await axios.get('http://localhost:5000/api/products',
          { withCredentials: true }
        );
        setAllProducts(allProductsResponse.data);
        setLoading(false);
      } catch (err) {

        setError(err.response?.data?.error || 'Failed to fetch product');
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        try {
          const response = await axiosInstance.get('/wishlist');
          dispatch(setWishlist(response.data));
        } catch (error) {

        }
      }
    };

    fetchWishlist();
  }, [isAuthenticated, dispatch]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const selectedVariant = product.variants.find(v => v.size === selectedSize);
    if (!selectedVariant || selectedVariant.stock < 1) {
      toast.error('Selected size is out of stock');
      return;
    }

    const existingCartItem = (cartItems || []).find(item =>
      item.productId === product._id && item.selectedSize === selectedSize
    );

    const totalQuantity = (existingCartItem ? existingCartItem.quantity : 0) + quantity;

    if (totalQuantity > 5) {
      toast.error('Maximum limit is 5 items per product');
      setShowCart(true);
      return;
    }

    if (quantity > selectedVariant.stock || quantity > 5) {
      toast.error('Maximum quantity exceeded');
      setShowCart(true)
      return;
    }

    try {
      const productToAdd = {
        productId: product._id,
        selectedSize: selectedSize,
        quantity: quantity
      };
      await axiosInstance.post('/cart/add', productToAdd);

      const updatedCartResponse = await axiosInstance.get('/cart');
      if (updatedCartResponse.data) {

        const cartItems = updatedCartResponse.data.items.map(item => ({
          productId: item.productId._id,
          name: item.productId.name,
          price: item.price,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          image: item.productId.images[0]?.url || item.productId.images[0],
          stock: item.productId.variants.find(v => v.size === item.selectedSize)?.stock || 0,
          maxPerPerson: 5
        }));

        dispatch(setCart(cartItems));
        setShowCart(true);
        toast.success('Added to cart successfully');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Failed to add to cart';
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        toast.error('Please login to continue');
        navigate('/login');
      } else {
        toast.error('An error occurred while adding to cart');
      }

    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div className="error-message">Product not found</div>;

  const {
    name,
    originalPrice,
    salePrice,
    images,
    rating,
    description,
    variants
  } = product;

  const relatedProducts = allProducts
    .filter(p => p._id !== productId)
    .slice(0, 4);

  const reviews = [
    { author: "Belwin Raphel", rating: 5, comment: "Great product! Highly recommended." },
    { author: "Al Ameen", rating: 4, comment: "Good quality, but a bit pricey." },
    { author: "Nanda Kumar", rating: 5, comment: "Excellent service and fast delivery." }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ));
  };

  const getMaxQuantity = (size) => {
    const variant = variants.find(v => v.size === size);
    if (!variant) return 0;
    return Math.min(variant.stock, product.maxPerPerson || 5);
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      const isItemInWishlist = wishlistItems.some(item => item._id === product._id);

      if (isItemInWishlist) {
        dispatch(removeFromWishlist(product._id));
        await axiosInstance.delete(`/wishlist/remove/${product._id}`);
        // dispatch(removeFromWishlist(product._id));
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        dispatch(addToWishlist(product));
        const response = await axiosInstance.post('/wishlist/add', {
          productId: product._id
        });

        if (!response.data.success) {
          // Revert the optimistic update if the API call fails
          dispatch(removeFromWishlist(product._id));
          throw new Error('Failed to add to wishlist');
      }
      
      toast.success('Added to wishlist');
  }
    } catch (error) {

      toast.error(error.response?.data?.error || 'Error updating wishlist');
      try {
        const response = await axiosInstance.get('/wishlist');
            dispatch(setWishlist(response.data));
      } catch (error) {
        console.error('Error refreshing wishlist:', refreshError);
      }
    }
  };

  return (
    <>
      <Header />
      <Breadcrumbs />
      <div className="product-detail-container">
        <div className="product-detail-grid">
          <div className="image-gallery">
            <div
              className={`main-image-container ${isZoomed ? 'zoomed' : ''}`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={images[selectedImage]?.url || images[selectedImage]}
                alt={name}
                className="main-image"
              />
            </div>
            <div className="thumbnail-grid">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`thumbnail-button ${selectedImage === idx ? 'selected' : ''}`}
                >
                  <img
                    src={img.url || img}
                    alt={`${name} ${idx + 1}`}
                    className="thumbnail-image"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="rating-container">
              <div className="stars">{renderStars(rating)}</div>
              <span className="rating-count">{reviews.length} Ratings</span>
            </div>

            <h1 className="product-name">{name}</h1>

            <div className="price-section">
              <div className="price-container">
                <span className="current-price">₹{salePrice || originalPrice}</span>
                {salePrice && (
                  <>
                    <span className="original-price">MRP ₹{originalPrice}</span>
                    <span className="discount">
                      ({Math.ceil((originalPrice - salePrice) / originalPrice * 100)}% OFF)
                    </span>
                  </>
                )}
              </div>
              <p className="tax-info">inclusive of all taxes</p>
            </div>

            <div className="size-options">
              {["S", "M", "L", "XL", "XXL"].map((size) => {
                const variantExists = product.variants.find((v) => v.size === size);
                const isAvailable = variantExists && variantExists.stock > 0;

                return (
                  <button
                    key={size}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSize(size);
                        setQuantity(1);
                      }
                    }}
                    className={`size-button 
                      ${!isAvailable ? 'unavailable' : ''} 
                      ${selectedSize === size ? 'selected' : ''}`}
                    disabled={!isAvailable}
                  >
                    <span className="size-text">{size}</span>
                    {!isAvailable && <div className="strike-through"></div>}
                    {isAvailable && variantExists.stock <= 5 && (
                      <span className="stock-label">{variantExists.stock} left</span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedSize && (
              <div className="quantity-selector">
                <span>QUANTITY:</span>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{quantity}</span>
                  <button
                    onClick={() => {
                      const maxQty = getMaxQuantity(selectedSize);
                      setQuantity((q) => Math.min(maxQty, q + 1));
                    }}
                    disabled={quantity >= getMaxQuantity(selectedSize)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <Cart
              show={showCart}
              onHide={() => setShowCart(false)}
            />

            <div className="action-buttons">
              <button
                className="add-to-bag"
                onClick={handleAddToCart}
                disabled={!selectedSize || !isAuthenticated}
              >
                {!isAuthenticated
                  ? 'LOGIN TO ADD'
                  : !selectedSize
                    ? 'SELECT SIZE'
                    : 'ADD TO BAG'}
              </button>
              <button
                className="wishlist"
                onClick={handleWishlistClick}
                style={{ cursor: 'pointer' }}
              >
                <Heart
                  size={20}
                  fill={(wishlistItems || []).some(item => item._id === product._id) ? "currentColor" : "none"}
                />
                WISHLIST
              </button>
            </div>

            <div className="product-description">
              <h3>Product Description</h3>
              <p>{description}</p>
            </div>

            <div className="reviews-section">
              <h2>Customer Reviews</h2>
              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="review">
                      <div className="review-header">
                        <div className="review-rating">{renderStars(review.rating)}</div>
                        <span className="review-author">{review.author}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet</p>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  _id={product._id}
                  name={product.name}
                  images={product.images}
                  originalPrice={product.originalPrice}
                  salePrice={product.salePrice}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );

};

export default ProductDetail;