// components/ImageSlider.jsx
'use client';

import { useState, useEffect } from 'react';

const ImageSlider = ({
  images,
  productDetails,
  productFeatures

}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slideImages = images.slice(2);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto slide
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="slider-container">
      <div className="slider-header">
        <div className="header-item">{productDetails.product_collection}</div>
        <div className="header-item">{productDetails.fabric}</div>
        <div className="header-item">{productDetails.style}</div>
        <div className="header-item">{productDetails.gender}</div>
      </div>
      
      <div 
        className="slider"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slideImages.map((image, index) => (
          <div key={index} className="slide">
            <img src={image} alt='' />
            <div className="slide-content">
              {/* <div className="slide-title">{slide.title}</div> */}
              <div className="slide-subtitle">{productFeatures[index]}</div>
              {/* <div className="slide-counter">{slide.counter}</div> */}
            </div>
          </div>
        ))}
      </div>
      
      <div className="slider-nav">
        <button className="nav-btn prev-btn" onClick={prevSlide}>&#10094;</button>
        <button className="nav-btn next-btn" onClick={nextSlide}>&#10095;</button>
      </div>
      
      <div className="slider-indicators">
        {slideImages.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      <style jsx>{`
        .slider-container {
          width: 100%;
          max-width: 900px;
          position: relative;
          overflow: hidden;
          border-radius: 15px;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }
        
        .slider {
          display: flex;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 500px;
        }
        
        .slide {
          min-width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 15px;
        }
        
        .slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1s ease;
        }
        
        .slide:hover img {
          transform: scale(1.05);
        }
        
        .slide-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 30px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: white;
        }
        
        .slide-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .slide-subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 10px;
        }
        
        .slide-counter {
          font-size: 18px;
          font-weight: bold;
        }
        
        .slider-nav {
          position: absolute;
          top: 50%;
          width: 100%;
          display: flex;
          justify-content: space-between;
          transform: translateY(-50%);
          padding: 0 20px;
          z-index: 10;
        }
        
        .nav-btn {
          background: rgba(255, 255, 255, 0.2);
          // backdrop-filter: blur(10px);
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .nav-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        .slider-indicators {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 10px;
          z-index: 10;
        }
        
        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .indicator.active {
          background: white;
          transform: scale(1.2);
        }
        
        .slider-header {
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 30px;
          z-index: 10;
        }
        
        .header-item {
          color: white;
          font-size: 13px;
          font-weight: 500;
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        
          // backdrop-filter: blur(5px);
        }
        
        .header-item:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        @media (max-width: 768px) {
          .slider {
            height: 400px;
          }
          
          .slide-title {
            font-size: 24px;
          }
          
          .slider-header {
            gap: 15px;
          }
          
          .header-item {
            font-size: 14px;
            padding: 6px 12px;
          }
        }
        
        @media (max-width: 480px) {
          .slider {
            height: 300px;
          }
          
          .slide-title {
            font-size: 20px;
          }
          .slide-subtitle {
          font-size: 10px;
          opacity: 0.9;
          margin-bottom: 10px;
          }
          
          .slide-content {
            padding: 20px;
          }
          
          .slider-header {
            gap: 10px;
          }
          
          .header-item {
            font-size: 9px;
            padding: 5px 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;