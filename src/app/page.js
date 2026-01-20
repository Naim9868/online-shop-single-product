// app/page.js - UPDATED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductShowcase from '@/components/ProductShowcase';
import OrderForm from '@/components/OrderForm';
// app/page.js - Add these imports
import { fallbackProduct, fallbackHero } from '@/lib/falbackData';


// 🔥 PRELOAD: Warm up the APIs before React loads
if (typeof window !== 'undefined') {
  // Pre-fetch critical APIs in background
  setTimeout(() => {
    fetch('/api/selected-product').catch(() => {});
    fetch('/api/hero').catch(() => {});
  }, 100);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [billingInfo, setBillingInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ADD: Track individual loading states
  const [loadingStates, setLoadingStates] = useState({
    hero: true,
    selected: true,
    product: true,
    delivery: true
  });

  // Memoized scroll function
  const scrollToOrderForm = useCallback(() => {
    const orderFormElement = document.getElementById('order-form-section');
    if (orderFormElement) {
      orderFormElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  // Order data handling with validation
  const handleOrderData = useCallback((data) => {
    const updated = { ...billingInfo, ...data };
    setBillingInfo(updated);

    if (data.shipping) {
      setShippingMethod(data.shipping);
    }
    if (data.size) {
      setSelectedSize(data.size);
    }
  }, [billingInfo]);

  // Animation variants
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  });

  // Optimized data fetching with progressive loading
useEffect(() => {
  let mounted = true;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Try to fetch selected product (with retry logic)
      let selectedProductData = null;
      let retryCount = 0;
      
      while (retryCount < 3 && !selectedProductData) {
        try {
          const response = await fetch('/api/selected-product');
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.selectedProduct) {
              selectedProductData = data.selectedProduct;
              break;
            }
          }
        } catch (err) {
          console.log(`Retry ${retryCount + 1} failed:`, err.message);
        }
        
        retryCount++;
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // 🔥 USE FALLBACK if API failed
      if (!selectedProductData) {
        console.log('Using fallback product data');
        selectedProductData = fallbackProduct;
      }
      
      if (mounted) {
        setSelectedProduct(selectedProductData);
      }

      // 2. Try to fetch hero data (optional)
      try {
        const heroResponse = await fetch('/api/hero');
        
        if (heroResponse.ok) {
          const heroData = await heroResponse.json();
          if (mounted) {
            setHeroData(heroData);
          }
        } else {
          // 🔥 USE FALLBACK hero data
          if (mounted) {
            setHeroData(fallbackHero);
          }
        }
      } catch (heroErr) {
        console.log('Hero API failed, using fallback');
        if (mounted) {
          setHeroData(fallbackHero);
        }
      }

      // 3. Load delivery in background (optional)
      setTimeout(async () => {
        if (mounted) {
          try {
            const deliveryResponse = await fetch('/api/delivery');
            if (deliveryResponse.ok) {
              const deliveryData = await deliveryResponse.json();
              setDeliveryCharge(deliveryData);
            } else {
              setDeliveryCharge({ charge: 60 }); // Default delivery
            }
          } catch (deliveryErr) {
            setDeliveryCharge({ charge: 60 }); // Default delivery
          }
        }
      }, 1000);

      // 4. Load products list in background (optional)
      setTimeout(async () => {
        if (mounted) {
          try {
            const productsResponse = await fetch('/api/products');
            if (productsResponse.ok) {
              const productsData = await productsResponse.json();
              setProducts(productsData.products || []);
            }
          } catch (productsErr) {
            // Ignore - products list is not critical
          }
        }
      }, 1500);

    } catch (err) {
      if (mounted) {
        console.error('Error fetching data:', err);
        
        // 🔥 USE FALLBACK DATA ON COMPLETE FAILURE
        setSelectedProduct(fallbackProduct);
        setHeroData(fallbackHero);
        setDeliveryCharge({ charge: 60 });
        
        setError('Using demo data - real data loading shortly');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    mounted = false;
  };
}, []);

  // 🔥 NEW: Check if we can show page with partial data
  useEffect(() => {
    // If we have hero data and selected product, we can show page
    if (heroData !== null && selectedProduct !== null) {
      setLoading(false);
    }
  }, [heroData, selectedProduct]);

  // Get final hero data
  const getFinalHeroData = useCallback(() => {
    if (selectedProduct?.heroData) {
      return {
        ...heroData,
        ...selectedProduct.heroData
      };
    }
    return heroData;
  }, [selectedProduct, heroData]);

  const finalHeroData = getFinalHeroData();

  // 🔥 UPDATED: Better loading state - show partial content
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 text-gray-800 font-sans">
        {/* Show hero section immediately if we have data */}
        {heroData && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeIn()}
            className="text-center bg-red-600 text-white py-8 rounded-b-3xl shadow-lg"
          >
            <h1 className="text-xl md:text-2xl font-bold mb-3 animate-pulse">
              {heroData.mainTitle || 'Loading...'}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm md:text-base">
              <span className="line-through opacity-80">
                ৳{heroData.originalPrice || '...'}
              </span>
              <span className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold">
                {heroData.buttonText || 'Loading'} ৳{heroData.currentPrice || '...'}
              </span>
            </div>
            <div className="mt-5 bg-white/20 text-white font-semibold px-8 py-2 rounded-xl opacity-50">
              Loading product...
            </div>
          </motion.section>
        )}

        {/* Show product skeleton */}
        <div className="p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto mt-4 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-300 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mt-8"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Show loading indicator */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            Loading product details...
          </div>
        </div>
      </div>
    );
  }

  // Error state - show partial content if possible
 // Error state - show fallback content
if (error) {
  return (
    <div className="min-h-screen bg-gray-200 text-gray-800 font-sans">
      {/* Show hero with fallback data */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn()}
        className="text-center bg-red-600 text-white py-8 rounded-b-3xl shadow-lg"
      >
        <h1 className="text-xl md:text-2xl font-bold mb-3">
          {fallbackHero.mainTitle}
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm md:text-base">
          <span className="line-through opacity-80">
            ৳{fallbackHero.originalPrice}
          </span>
          <span className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold">
            {fallbackHero.buttonText} ৳{fallbackHero.currentPrice}
          </span>
        </div>
        <button
          onClick={scrollToOrderForm}
          className="mt-5 bg-white text-red-600 font-semibold px-8 py-2 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
        >
          অর্ডার করতে চাই
        </button>
      </motion.section>

      {/* Show product with fallback data */}
      <ProductShowcase
        onOrderClick={scrollToOrderForm}
        product={fallbackProduct}
      />

      {/* Show order form with fallback data */}
      <div id="order-form-section">
        <OrderForm
          product={fallbackProduct}
          onOrderDataChange={handleOrderData}
          selectedSize={selectedSize}
          shippingMethod={shippingMethod}
          deliveryCharge={{ charge: 60 }} // Fallback delivery
        />
      </div>

      {/* Show warning message */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Showing demo data. Real data will load automatically...
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
            >
              Try loading again
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 sm:py-8 text-center text-sm text-gray-600 bg-white mt-2">
        <div className="container mx-auto px-4">
          <p>© 2025 Positive | All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-500">Secure payment processing | Fast delivery</p>
        </div>
      </footer>
    </div>
  );
}



 // No product selected state - use fallback
if (!selectedProduct) {
  return (
    <div className="min-h-screen bg-gray-200 text-gray-800 font-sans">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn()}
        className="text-center bg-red-600 text-white py-8 rounded-b-3xl shadow-lg"
      >
        <h1 className="text-xl md:text-2xl font-bold mb-3">
          {fallbackHero.mainTitle}
        </h1>
        <div className="flex items-center justify-center gap-2 text-sm md:text-base">
          <span className="line-through opacity-80">
            ৳{fallbackHero.originalPrice}
          </span>
          <span className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold">
            {fallbackHero.buttonText} ৳{fallbackHero.currentPrice}
          </span>
        </div>
        <button
          onClick={scrollToOrderForm}
          className="mt-5 bg-white text-red-600 font-semibold px-8 py-2 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
        >
          অর্ডার করতে চাই
        </button>
      </motion.section>

      <ProductShowcase
        onOrderClick={scrollToOrderForm}
        product={fallbackProduct}
      />

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              No product selected yet. Showing demo product.
            </p>
          </div>
        </div>
      </div>

      <div id="order-form-section">
        <OrderForm
          product={fallbackProduct}
          onOrderDataChange={handleOrderData}
          selectedSize={selectedSize}
          shippingMethod={shippingMethod}
          deliveryCharge={{ charge: 60 }}
        />
      </div>

      <footer className="py-5 sm:py-8 text-center text-sm text-gray-600 bg-white mt-2">
        <div className="container mx-auto px-4">
          <p>© 2025 Positive | All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-500">Secure payment processing | Fast delivery</p>
        </div>
      </footer>
    </div>
  );
}

  // 🔥 MAIN PAGE RENDER - Shows even if some data missing
  return (
    <div className="min-h-screen bg-gray-200 text-gray-800 font-sans">
      {/* Hero Section - Always shows if we have heroData */}
      {heroData && (
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn()}
          className="text-center bg-red-600 text-white py-8 rounded-b-3xl shadow-lg"
        >
          <h1 className="text-xl md:text-2xl font-bold mb-3">
            {finalHeroData?.mainTitle || 'Premium T-Shirt Collection'}
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm md:text-base">
            <span className="line-through opacity-80">
              ৳{finalHeroData?.originalPrice || '2000'}
            </span>
            <span className="bg-white text-red-600 px-4 py-1 rounded-full font-semibold">
              {finalHeroData?.buttonText || 'Special Offer'} ৳{finalHeroData?.currentPrice || '990'}
            </span>
          </div>
          <button
            onClick={scrollToOrderForm}
            className="mt-5 bg-white text-red-600 font-semibold px-8 py-2 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            অর্ডার করতে চাই
          </button>
        </motion.section>
      )}

      {/* Product Showcase - Only shows if we have product */}
      {selectedProduct && (
        <ProductShowcase
          onOrderClick={scrollToOrderForm}
          product={selectedProduct}
        />
      )}

      {/* Order Form Section - Only shows if we have product */}
      {selectedProduct && (
        <div id="order-form-section">
          <OrderForm
            product={selectedProduct}
            onOrderDataChange={handleOrderData}
            selectedSize={selectedSize}
            shippingMethod={shippingMethod}
            deliveryCharge={deliveryCharge}
          />
        </div>
      )}

      {/* Footer - Always shows */}
      <footer className="py-5 sm:py-8 text-center text-sm text-gray-600 bg-white mt-2">
        <div className="container mx-auto px-4">
          <p>© 2025 Positive | All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-500">Secure payment processing | Fast delivery</p>
        </div>
      </footer>
    </div>
  );
}