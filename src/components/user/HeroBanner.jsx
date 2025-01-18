import { useState, useEffect } from 'react';
import './HeroBanner.css';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      image: "/assets/Naruto-Banner.jpg",
      title: "NARUTO COLLECTION",
      subtitle: "Exclusive Collection 2025",
    },
    {
      image: "/assets/home-Page-2.jpg",
      title: "WINTER COLLECTION",
      subtitle: "Exclusive Winter Collections for 2025",
    },
    {
      image: "/assets/Oversized-Banner.jpg",
      title: "OVER SIZED T-SHIRTS",
      subtitle: "New Arrivals Weekly",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === bannerSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide(current => 
      current === bannerSlides.length - 1 ? 0 : current + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(current => 
      current === 0 ? bannerSlides.length - 1 : current - 1
    );
  };

  return (
    <div className="hero-banner">
      <div className="slides-container">
        {bannerSlides.map((slide, index) => (
          <div 
            key={index} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})` 
            }}
          >
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>
              <button className="shop-now-btn">Shop Now</button>
            </div>
          </div>
        ))}
      </div>

      <button className="slide-arrow prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="slide-arrow next" onClick={nextSlide}>
        &#10095;
      </button>

      <div className="slide-dots">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;

