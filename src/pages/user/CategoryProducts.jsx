
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../../components/user/ProductCard';
import Filter from '../../components/user/Filter';
import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import './CategoryProduct.css';
import Breadcrumbs from '../../components/breadcrumbs/user/userBreadcrumbs';



const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

 
  const categories = [
    { id: "sports-shoes", name: "Sports Shoes", count: 9049 },
    { id: "tshirts", name: "Tshirts", count: 8877 },
    { id: "track-pants", name: "Track Pants", count: 4601 },
    { id: "innerwear-vests", name: "Innerwear Vests", count: 3317 },
    { id: "shorts", name: "Shorts", count: 3119 },
    { id: "jackets", name: "Jackets", count: 1056 },
    { id: "tracksuits", name: "Tracksuits", count: 1052 },
    { id: "socks", name: "Socks", count: 837 },
  ];

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/category/${categoryId}`,
          { withCredentials: true }
        );
        
        if (response.data) {
          console.log('Products:', response.data.products); 
          response.data.products.forEach(product => {
            console.log('Product ID:', product._id); 
          });
          setProducts(response.data.products || []);
          setCategory(response.data.category);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.error || 'Failed to fetch products');
        setLoading(false);
      }
    };
  
    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId]);

  const handleClearAll = () => {
    setSelectedGender("");
    setSelectedCategories([]);
  };


  const filteredProducts = products.filter((product) => {
    const genderMatch = !selectedGender || product.gender === selectedGender;
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.categoryId);
    return genderMatch && categoryMatch;
  });

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
            <h1>{category?.name || 'Category Products'}</h1>
            <p>{filteredProducts.length} products found</p>
          </div>

          <div className="content-container">
            <Filter
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              onClearAll={handleClearAll}
            />

            <div className="products-container">
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  <p>No products found in this category.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
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

