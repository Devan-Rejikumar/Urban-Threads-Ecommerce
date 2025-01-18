import React, { useEffect, useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import Header from '../../components/user/Header';
import Footer from '../../components/user/Footer';
import HeroBanner from '../../components/user/HeroBanner';
import Carousel from '../../components/user/Carousel';
import './home.css';

// When the page loads


const Home = () => {

  window.addEventListener('load', () => {
    // Get the token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Clean up the URL (optional)
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  });
  const navigate = useNavigate();
  // const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  // console.log('Home Component - Auth State:', { isAuthenticated, user, loading });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories', {
          withCredentials: true
        });

        const activeCategories = response.data.filter(
          category => category.isActive && !category.isDeleted
        );
        setCategories(activeCategories);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error fetching categories:', err);
      }
    };

    // if (isAuthenticated) {
      fetchCategories();
    // }
  }, []);

  const bestSellers = [
    {
      id: 1,
      name: "Bottoms",
      image: "/assets/Bottoms.jpg"
    },
    {
      id: 2,
      name: "Squid Game T-Shirts",
      image: "/assets/SquidGame.jpg"
    },
    {
      id: 3,
      name: "Jurassic Park Sneakers",
      image: "/assets/Jurassic-Park.jpg"
    },
    {
      id: 4,
      name: "Over Sized T-Shirts",
      image: "/assets/New Launch.jpg"
    }
  ];

  const newArrivals = [
    {
      id: 1,
      name: "Limited Edition Tee",
      price: 34.99,
      image: "/placeholder.svg?height=400&width=400"
    },
    {
      id: 2,
      name: "Collector's Hoodie",
      price: 64.99,
      image: "/placeholder.svg?height=400&width=400"
    },
    {
      id: 3,
      name: "Premium Sweatshirt",
      price: 54.99,
      image: "/placeholder.svg?height=400&width=400"
    },
    {
      id: 4,
      name: "Special Edition Cap",
      price: 29.99,
      image: "/placeholder.svg?height=400&width=400"
    }
  ];

  const fandoms = [
    { id: 1, name: "Naruto", image: "/placeholder.svg?height=300&width=300" },
    { id: 2, name: "Dragon Ball", image: "/placeholder.svg?height=300&width=300" },
    // { id: 3, name: "One Piece", image: "/placeholder.svg?height=300&width=300" },
    // { id: 4, name: "My Hero Academia", image: "/placeholder.svg?height=300&width=300" }
  ];

  // if (loading) {
  //   return <div className="loading">Loading...</div>;
  // }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <Header />
      <main>
        <HeroBanner />

        <section className="category-section">
          <h2 className="section-title">Shop By Category</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <Link 
                to={`/category/${category._id}`} 
                key={category._id} 
                className="category-card"
              >
                <img 
                  src={category.image?.url || "/placeholder.svg?height=300&width=300"} 
                  alt={category.name}
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=300&width=300";
                  }}
                />
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="best-sellers-section">
          <h2 className="section-title">Drop of the Week</h2>
          <Carousel items={bestSellers} />
        </section>

        {/* <section className="products-section">
          <h2 className="section-title">New Arrivals</h2>
          <div className="products-grid">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                isNew={true}
              />
            ))}
          </div>
        </section> */}

        {/* <section className="fandom-section">
          <h2 className="section-title">Shop by Fandom</h2>
          <div className="fandom-grid">
            {fandoms.map((fandom) => (
              <div key={fandom.id} className="fandom-card">
                <img src={fandom.image} alt={fandom.name} />
                <h3>{fandom.name}</h3>
              </div>
            ))}
          </div>
        </section> */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;

