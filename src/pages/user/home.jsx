// import React, { useEffect, useState } from "react"
// import { useNavigate, Link } from "react-router-dom"
// import axios from "axios"
// import Header from "../../components/user/Header"
// import Footer from "../../components/user/Footer"
// import HeroBanner from "../../components/user/HeroBanner"
// import Carousel from "../../components/user/Carousel"
// import "./home.css"
// import axiosInstance from "../../utils/axiosInstance"
// import ProductCard from "../../components/user/ProductCards"
// import { ChevronLeft, ChevronRight } from "lucide-react"
// import { isValidOffer, getOfferBadgeText } from '../../utils/offerUtils.js';

// const Home = () => {
//   window.addEventListener("load", () => {
//     const urlParams = new URLSearchParams(window.location.search)
//     const token = urlParams.get("token")

//     if (token) {
//       localStorage.setItem("token", token)
//       window.history.replaceState({}, document.title, window.location.pathname)
//     }
//   })

//   const navigate = useNavigate()
//   const [categories, setCategories] = useState([])
//   const [newArrivals, setNewArrivals] = useState([])
//   const [currentPage, setCurrentPage] = useState(0)
//   const [error, setError] = useState(null)
//   const [currentNewArrivalsPage, setCurrentNewArrivalsPage] = useState(0)

//   useEffect(() => {
//     const fetchNewArrivals = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/auth/new-arrivals", {
//           withCredentials: true,
//           params: {
//             populate: ['category', 'currentOffer'] 
//           }
//         })
//         setNewArrivals(response.data)
//       } catch (err) {
//         console.error("Error fetching new arrivals:", err)
//       }
//     }

//     fetchNewArrivals()
//   }, [])

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/categories", {
//           withCredentials: true,
//           params: {
//             populate: 'currentOffer'
//           }
//         })
//         console.log("Categories with offersssssssssssssssss:", response.data);
//         const activeCategories = response.data.filter((category) => category.isActive && !category.isDeleted)
//         setCategories(activeCategories)
//       } catch (err) {
//         setError("Failed to fetch categories")
//         console.error("Error fetching categories:", err)
//       }
//     }
//     fetchCategories()
//   }, [])

//   const bestSellers = [
//     {
//       id: 1,
//       name: "Bottoms",
//       image: "/assets/Bottoms.jpg",
//     },
//     {
//       id: 2,
//       name: "Squid Game T-Shirts",
//       image: "/assets/SquidGame.jpg",
//     },
//     {
//       id: 3,
//       name: "Jurassic Park Sneakers",
//       image: "/assets/Jurassic-Park.jpg",
//     },
//     {
//       id: 4,
//       name: "Over Sized T-Shirts",
//       image: "/assets/New Launch.jpg",
//     },
//   ]

//   const fandoms = [
//     { id: 1, name: "Naruto", image: "/placeholder.svg?height=300&width=300" },
//     { id: 2, name: "Dragon Ball", image: "/placeholder.svg?height=300&width=300" },
//   ]

//   const handlePrevNewArrivals = () => {
//     setCurrentNewArrivalsPage((prev) => Math.max(0, prev - 1))
//   }

//   const handleNextNewArrivals = () => {
//     setCurrentNewArrivalsPage((prev) => Math.min(Math.floor((newArrivals.length - 1) / 5), prev + 1))
//   }

//   if (error) {
//     return <div className="error">{error}</div>
//   }

//   return (
//     <div className="app">
//       <Header />
//       <main>
//         <HeroBanner />

//         <section className="category-section">
//           <h2 className="section-title">Shop By Category</h2>
//           <div className="category-grid">
//             {categories.map((category) => {
//               console.log("Category:", category.name, "Offer:", category.currentOffer); // Log each category and its offer
//               return (
//                 <Link to={`/category/${category._id}`} key={category._id} className="category-card">
//                   <div className="category-image-container">
//                     <img
//                       src={category.image?.url || "/placeholder.svg?height=300&width=300"}
//                       alt={category.name}
//                       onError={(e) => {
//                         e.target.src = "/placeholder.svg?height=300&width=300"
//                       }}
//                     />
//                     {category.currentOffer && isValidOffer(category.currentOffer) && (
//                       <div className="offer-badge">
//                         {getOfferBadgeText(category.currentOffer)}
//                       </div>
//                     )}
//                   </div>
//                   <h3>{category.name}</h3>
//                   {category.currentOffer && isValidOffer(category.currentOffer) && (
//                     <p className="offer-name">{category.currentOffer.name}</p>
//                   )}
//                 </Link>
//               );
//             })}
//           </div>
//         </section>

//         <section className="best-sellers-section">
//           <h2 className="section-title">Drop of the Week</h2>
//           <Carousel items={bestSellers} />
//         </section>

//         <section className="products-section">
//           <h2 className="section-title">New Arrivals</h2>
//           <div className="new-arrivals-container">
//             <button
//               className="arrow-button left"
//               onClick={handlePrevNewArrivals}
//               disabled={currentNewArrivalsPage === 0}
//             >
//               <ChevronLeft />
//             </button>
//             <div className="products-grid">
//               {newArrivals.slice(currentNewArrivalsPage * 5, (currentNewArrivalsPage + 1) * 5).map((product) => (
//                 <ProductCard key={product._id} {...product} isNew={true} />
//               ))}
//             </div>
//             <button
//               className="arrow-button right"
//               onClick={handleNextNewArrivals}
//               disabled={currentNewArrivalsPage === Math.floor((newArrivals.length - 1) / 5)}
//             >
//               <ChevronRight />
//             </button>
//           </div>
//         </section>

//         {/* Commented out fandom section as per original code
//         <section className="fandom-section">
//           <h2 className="section-title">Shop by Fandom</h2>
//           <div className="fandom-grid">
//             {fandoms.map((fandom) => (
//               <div key={fandom.id} className="fandom-card">
//                 <img src={fandom.image || "/placeholder.svg"} alt={fandom.name} />
//                 <h3>{fandom.name}</h3>
//               </div>
//             ))}
//           </div>
//         </section>
//         */}
//       </main>
//       <Footer />
//     </div>
//   )
// }

// export default Home


import React, { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import Header from "../../components/user/Header"
import Footer from "../../components/user/Footer"
import HeroBanner from "../../components/user/HeroBanner"
import Carousel from "../../components/user/Carousel"
import "./home.css"
import axiosInstance from "../../utils/axiosInstance"
import ProductCard from "../../components/user/ProductCards"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isValidOffer, getOfferBadgeText } from '../../utils/offerUtils';

const Home = () => {
  // Token handling from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentNewArrivalsPage, setCurrentNewArrivalsPage] = useState(0);

  // Fetch new arrivals with offers
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/new-arrivals", {
          
          withCredentials: true,
          params: {
            populate: ['category', 'currentOffer']
          }
        });
        console.log("New arrivals data:", response.data);
        setNewArrivals(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Failed to fetch new arrivals");
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Fetch categories with offers
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/categories", {
          withCredentials: true,
          params: {
            populate: 'currentOffer'
          }
        });
        console.log("Categories with offers:", response.data);
        const activeCategories = response.data.filter(
          (category) => category.isActive && !category.isDeleted
        );
        setCategories(activeCategories);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch categories");
        console.error("Error fetching categories:", err);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Sample data for best sellers section
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

  // Navigation handlers for new arrivals carousel
  const handlePrevNewArrivals = () => {
    setCurrentNewArrivalsPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextNewArrivals = () => {
    setCurrentNewArrivalsPage((prev) => 
      Math.min(Math.floor((newArrivals.length - 1) / 5), prev + 1)
    );
  };

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
          <h2 className="section-title">Shop By Category</h2>
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
          <h2 className="section-title">Drop of the Week</h2>
          <Carousel items={bestSellers} />
        </section>

        {/* New Arrivals Section */}
        <section className="products-section">
          <h2 className="section-title">New Arrivals</h2>
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
                .slice(currentNewArrivalsPage * 5, (currentNewArrivalsPage + 1) * 5)
                .map((product) => {
                  // Find the matching category for the product
                  const productCategory = categories.find(
                    (cat) => cat._id === product.category?._id
                  );
                  
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
              disabled={currentNewArrivalsPage === Math.floor((newArrivals.length - 1) / 5)}
            >
              <ChevronRight />
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

