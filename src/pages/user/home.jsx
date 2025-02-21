import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { publicAxios } from '../../utils/axiosInstance.js';
import Header from "../../components/user/Header"
import Footer from "../../components/user/Footer"
import HeroBanner from "../../components/user/HeroBanner"
import Carousel from "../../components/user/Carousel"
import "./home.css"
import ProductCard from "../../components/user/ProductCards"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isValidOffer, getOfferBadgeText } from '../../utils/offerUtils';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNewArrivalsPage, setCurrentNewArrivalsPage] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(4);

  // Update products per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setProductsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setProductsPerPage(2);
      } else if (window.innerWidth < 1280) {
        setProductsPerPage(3);
      } else {
        setProductsPerPage(4);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await publicAxios.get("/auth/new-arrivals", {
          params: {
            populate: ['category', 'currentOffer', 'category.currentOffer']
          }
        });
   
        // Sort by createdAt date to ensure newest products appear first
        const sortedArrivals = response.data.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log('Fetched arrivals with offers:', sortedArrivals);
        setNewArrivals(sortedArrivals);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch new arrivals");
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await publicAxios.get("/categories", {
          params: {
            populate: 'currentOffer'
          }
        });

        const activeCategories = response.data.filter(
          (category) => category.isActive && !category.isDeleted
        );
        setCategories(activeCategories);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch categories");
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const bestSellers = [
    {
      id: 1,
      name: "Bottoms",
      image: "/assets/Bottoms.jpg",
    },
    {
      id: 2,
      name: "Squid Game T-Shirts",
      image: "/assets/SquidGame.jpg",
    },
    {
      id: 3,
      name: "Jurassic Park Sneakers",
      image: "/assets/Jurassic-Park.jpg",
    },
    {
      id: 4,
      name: "Over Sized T-Shirts",
      image: "/assets/New Launch.jpg",
    },
  ];

  const handlePrevNewArrivals = () => {
    setCurrentNewArrivalsPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextNewArrivals = () => {
    const maxPage = Math.ceil(newArrivals.length / productsPerPage) - 1;
    setCurrentNewArrivalsPage((prev) => Math.min(maxPage, prev + 1));
  };

  // Calculate total pages
  const totalPages = Math.ceil(newArrivals.length / productsPerPage);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <Header />
      <main>
        <HeroBanner />

        {/* Categories Section */}
        <section className="category-section">
        <h2 
    className="section-title"
    style={{
      fontSize: '2.5rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: '2rem',
      position: 'relative',
      paddingBottom: '1rem',
  
      letterSpacing: '0.05em'
    }}
  >
    Shop By Category
  </h2>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                to={`/category/${category._id}`}
                key={category._id}
                className="category-card"
              >
                <div className="category-image-container">
                  <img
                    src={category.image?.url || "/placeholder.svg?height=300&width=300"}
                    alt={category.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=300&width=300";
                    }}
                  />
                  {category.currentOffer && isValidOffer(category.currentOffer) && (
                    <div className="offer-badge">
                      {getOfferBadgeText(category.currentOffer)}
                    </div>
                  )}
                </div>
                <h3>{category.name}</h3>
                {category.currentOffer && isValidOffer(category.currentOffer) && (
                  <p className="offer-name">{category.currentOffer.name}</p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Best Sellers Section */}
        <section className="best-sellers-section">
        <h2 
    className="section-title"
    style={{
      fontSize: '2.5rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: '2rem',
      position: 'relative',
      paddingBottom: '1rem',
      letterSpacing: '0.05em'
    }}
  >
    Drop of the Week
  </h2>
          <Carousel items={bestSellers} />
        </section>

        {/* New Arrivals Section */}
        <section className="products-section">
        <h2 
    className="section-title"
    style={{
      fontSize: '2.5rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: '2rem',
      position: 'relative',
      paddingBottom: '1rem',
      letterSpacing: '0.05em'
    }}
  >
    New Arrivals
  </h2>

          <div className="new-arrivals-container">
            <button
              className="arrow-button left"
              onClick={handlePrevNewArrivals}
              disabled={currentNewArrivalsPage === 0}
            >
              <ChevronLeft />
            </button>
            <div className="products-grid">
              {newArrivals
                .slice(
                  currentNewArrivalsPage * productsPerPage,
                  (currentNewArrivalsPage + 1) * productsPerPage
                )
                .map((product) => {
                  // Find the matching category for the product
                  const productCategory = categories.find(
                    (cat) => cat._id === product.category?._id
                  );
                  // In Home.jsx, inside the new arrivals mapping
                 console.log('Passing to ProductCard:', {
      product,
      productCategory,
      currentOffer: product.currentOffer,
      categoryOffer: productCategory?.currentOffer
    });

                  return (
                    <ProductCard
                      key={product._id}
                      {...product}
                      category={productCategory} // Pass full category object with its offer
                      isNew={true}
                    />
                  );
                })}
            </div>
            <button
              className="arrow-button right"
              onClick={handleNextNewArrivals}
              disabled={currentNewArrivalsPage >= totalPages - 1}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="pagination-indicator">
            <span>{currentNewArrivalsPage + 1} / {Math.max(1, totalPages)}</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;