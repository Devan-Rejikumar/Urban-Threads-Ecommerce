import React, { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className="carousel" role="region" aria-label="Best Sellers Carousel">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
          aria-hidden={index !== currentIndex}
        >
          <img src={item.image} alt={item.name} />
          <div className="carousel-caption">{item.name}</div>
        </div>
      ))}
      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;

