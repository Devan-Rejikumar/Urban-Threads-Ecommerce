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
import Breadcrumbs from '../BreadCrumps';


const colorOptions = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Navy', hex: '#000080' }
];

const Shop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.userAuth);
  const wishlistItems = useSelector(state => state.wishlist.items);

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [sortOption, setSortOption] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [colorSearchQuery, setColorSearchQuery] = useState('');
  const [wishlistState, setWishlistState] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Effects
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const initialWishlistState = {};
    wishlistItems.forEach(item => {
      initialWishlistState[item._id] = true;
    });
    setWishlistState(initialWishlistState);
  }, [wishlistItems]);

  useEffect(() => {

    const colors = new Set();
    products.forEach(product => {
      product.variants.forEach(variant => {
        if (variant.color) {
          colors.add(variant.color);
        }
      });
    });
    const uniqueColors = Array.from(colors).map(hex => {
      const colorOption = colorOptions.find(c => c.hex === hex);
      return colorOption || { name: hex, hex: hex };
    });
    setAvailableColors(uniqueColors);
  }, [products]);


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
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        withCredentials: true
      });
      if (response.status === 200) {
        // Check if response.data is an array or an object with a products property
        const productsArray = Array.isArray(response.data) 
          ? response.data 
          : response.data.products || [];
          
        const listedProducts = productsArray.filter(product => product.isListed);
        setProducts(listedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
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
        await axiosInstance.delete(`/wishlist/remove/${product._id}`);
        setWishlistState(prev => ({ ...prev, [product._id]: false }));
        dispatch(removeFromWishlist(product._id));
        toast.success('Removed from wishlist');
      } else {
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
    setCurrentPage(1);
  };

  const handleColorChange = (hex) => {
    setSelectedColors(prev => {
      if (prev.includes(hex)) {
        return prev.filter(c => c !== hex);
      } else {
        return [...prev, hex];
      }
    });
    setCurrentPage(1);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSearchQuery('');
    setCategorySearchQuery('');
    setColorSearchQuery('');
    setSortOption('featured');
    setCurrentPage(1);
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategories.length === 0 ||
      selectedCategories.includes(product.category._id);

    const colorMatch = selectedColors.length === 0 ||
      product.variants.some(variant => selectedColors.includes(variant.color));

    const searchMatch = product.name.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return categoryMatch && colorMatch && searchMatch;
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


  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const filteredColors = availableColors.filter(color =>
    color.name.toLowerCase().includes(colorSearchQuery.toLowerCase())
  );


  const getColorCount = (colorHex) => {
    return products.filter(product =>
      product.variants.some(variant => variant.color === colorHex)
    ).length;
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };
  return (
    <div className="shop-container">
      <Header />
      <div className="container py-4">
        <Breadcrumbs />
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="sidebar">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">FILTERS</h2>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              </div>

              {/* Categories Section */}
              <div className="filter-section mb-4">
                <h3 className="h6 mb-3">CATEGORIES</h3>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search Categories"
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

              {/* Colors Section */}
              <div className="filter-section">
                <h3 className="h6 mb-3">COLORS</h3>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search Colors"
                    value={colorSearchQuery}
                    onChange={(e) => setColorSearchQuery(e.target.value)}
                  />
                </div>
                <div className="color-list">
                  {filteredColors.map((color) => (
                    <div className="form-check mb-2" key={color.hex}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`color-${color.hex}`}
                        checked={selectedColors.includes(color.hex)}
                        onChange={() => handleColorChange(color.hex)}
                      />
                      <label
                        className="form-check-label d-flex align-items-center gap-2"
                        htmlFor={`color-${color.hex}`}
                      >
                        <div
                          className="color-preview"
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: color.hex,
                            borderRadius: '50%',
                            border: '1px solid #ddd'
                          }}
                        ></div>
                        <span style={{
                          color: ['#FFFFFF', '#FFFF00'].includes(color.hex) ? '#000000' : 'inherit'
                        }}>
                          {color.name} ({getColorCount(color.hex)})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            {/* Search and Sort */}
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

            {/* Products Count */}
            <h2 className="h4 mb-4">
              All Products ({sortedProducts.length} items)
            </h2>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="row g-4">
                  {currentProducts.map((product) => (
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
                            <span className="sale-price">₹{product.salePrice}</span>
                            {product.originalPrice > product.salePrice && (
                              <span className="original-price">₹{product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <nav className="d-flex justify-content-center mt-4">
                  <ul className="pagination">
                    {/* Add Previous button */}
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, index) => (
                      <li
                        key={index}
                        className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                      >
                        <button
                          onClick={() => paginate(index + 1)}
                          className="page-link"
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}

                    {/* Add Next button */}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;