import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './shop.css';
import Header from './Header';
import Footer from './Footer';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosInstance';
import { setWishlist, removeFromWishlist } from '../../redux/slices/whishlistSlice';

const Shop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.userAuth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const wishlistItems = useSelector(state => state.wishlist.items);
  const [wishlistState, setWishlistState] = useState({});  // Local state for heart colors

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    // Initialize wishlist state based on Redux wishlist
    const initialWishlistState = {};
    wishlistItems.forEach(item => {
      initialWishlistState[item._id] = true;
    });
    setWishlistState(initialWishlistState);
  }, [wishlistItems]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/categories', {
        withCredentials: true
      });
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        withCredentials: true
      });
      if (response.status === 200) {
        const listedProducts = response.data.filter(product => product.isListed);
        setProducts(listedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistClick = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      const isInWishlist = wishlistState[product._id];
      
      if (isInWishlist) {
        // Remove from wishlist
        await axiosInstance.delete(`/wishlist/remove/${product._id}`);
        setWishlistState(prev => ({ ...prev, [product._id]: false }));
        dispatch(removeFromWishlist(product._id));
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const response = await axiosInstance.post('/wishlist/add', { 
          productId: product._id 
        });
        setWishlistState(prev => ({ ...prev, [product._id]: true }));
        dispatch(setWishlist(response.data));
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Error updating wishlist');
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Filter and sort products (unchanged)
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategories.length === 0 ||
      selectedCategories.includes(product.category._id);

    const searchMatch = product.name.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return (a.salePrice || a.originalPrice) - (b.salePrice || b.originalPrice);
      case 'price-desc':
        return (b.salePrice || b.originalPrice) - (a.salePrice || a.originalPrice);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'featured':
      default:
        return 0;
    }
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  return (
    <div className="shop-container">
      <Header />
      <div className="container py-4">
        {/* Sidebar remains unchanged */}
        <div className="row">
          <div className="col-lg-3">
            {/* Categories section - unchanged */}
            <div className="sidebar">
              <h2 className="h5 mb-4">CATEGORIES</h2>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search for Categories"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                />
              </div>
              <div className="category-list">
                {filteredCategories.map((category) => (
                  <div className="form-check mb-2" key={category._id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={category._id}
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCategoryChange(category._id)}
                    />
                    <label className="form-check-label" htmlFor={category._id}>
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="search-sort-container d-flex gap-3 align-items-center w-100">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="form-select w-auto"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <h2 className="h4 mb-4">
              All Products - {sortedProducts.length} items
            </h2>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {sortedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="col-md-6 col-lg-4"
                    onClick={() => handleProductClick(product._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-card">
                      <div className="product-image-container">
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="product-image"
                        />
                        <button
                          className="wishlist-btn"
                          onClick={(e) => handleWishlistClick(e, product)}
                          style={{ color: wishlistState[product._id] ? 'red' : 'inherit' }}
                        >
                          <Heart
                            size={20}
                            fill={wishlistState[product._id] ? "red" : "none"}
                            color={wishlistState[product._id] ? "red" : "currentColor"}
                          />
                        </button>
                      </div>
                      <div className="product-info">
                        <h3 className="product-title">{product.name}</h3>
                        <div className="product-price">
                          <span className="sale-price">${product.salePrice}</span>
                          {product.originalPrice > product.salePrice && (
                            <span className="original-price">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;