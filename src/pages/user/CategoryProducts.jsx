import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductCard } from '../../components/user/ProductCard';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import './CategoryProduct.css';
import Breadcrumbs from '../../components/breadcrumbs/user/userBreadcrumbs';
import axiosInstance from '../../utils/axiosInstance';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("featured");

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "popularity", label: "Popularity" },
    { value: "priceHighToLow", label: "Price: High to Low" },
    { value: "priceLowToHigh", label: "Price: Low to High" },
    { value: "avgRating", label: "Average Rating" },
    { value: "nameAZ", label: "Name: A to Z" },
    { value: "nameZA", label: "Name: Z to A" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axiosInstance.get(`/products/category/${categoryId}`);

        if (productResponse.data) {
          setProducts(productResponse.data.products || []);
          setCategory(productResponse.data.category);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to fetch data');
        setLoading(false);
      }
    };
    if(categoryId){
      fetchData();
    }
  }, [categoryId]);

  const getEffectivePrice = (product) => {
    return product.salePrice || product.originalPrice || 0;
  };

  const sortProducts = (products) => {
    const sortedProducts = [...products];

    switch (sortOption) {
      case "priceHighToLow":
        return sortedProducts.sort((a, b) =>
          getEffectivePrice(b) - getEffectivePrice(a)
        );

      case "priceLowToHigh":
        return sortedProducts.sort((a, b) =>
          getEffectivePrice(a) - getEffectivePrice(b)
        );

      case "nameAZ":
        return sortedProducts.sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );

      case "nameZA":
        return sortedProducts.sort((a, b) =>
          (b.name || '').localeCompare(a.name || '')
        );

      case "avgRating":
        return sortedProducts.sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });

      case "popularity":
        return sortedProducts.sort((a, b) => {
          const getPopularityScore = (product) => {
            const rating = product.rating || 0;
            const reviews = product.reviews?.length || 0;
            const sales = product.totalSales || 0;
            return (rating * 0.4) + (reviews * 0.3) + (sales * 0.3);
          };
          return getPopularityScore(b) - getPopularityScore(a);
        });

      case "featured":
      default:
        return sortedProducts;
    }
  };

  const sortedProducts = sortProducts(products);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div>Loading products...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-message">Error: {error}</div>
        </div>
      );
    }

    return (
      <div className="app">
        <Header />
        <Breadcrumbs categoryName={category?.name} />
        <main className="main-container">
          <div className="category-header">
            <div className="category-title">
              <h1>{category?.name || 'Category Products'}</h1>
              <p>{sortedProducts.length} products found</p>
            </div>
            <div className="sort-container">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="content-container">
            <div className="products-container">
              {sortedProducts.length === 0 ? (
                <div className="no-products">
                  <p>No products found in this category.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      {...product}
                      isNew={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  };

  return renderContent();
};

export default CategoryProducts;