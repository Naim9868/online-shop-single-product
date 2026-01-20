// app/page.js - UPDATED VERSION
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductShowcase from '@/components/ProductShowcase';
import OrderForm from '@/components/OrderForm';

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

  // 🔥 UPDATED: Load data incrementally like admin page
  useEffect(() => {
  

    const fetchDataIncrementally = async () => {
      try {
        setLoading(true);
        
        // Try to fetch selected product
        let selectedProduct = null;
        let retries = 0;
        
        while (retries < 3 && !selectedProduct) {
          try {
            const response = await fetch('/api/selected-product');
            const data = await response.json();
            
            if (data.success && data.selectedProduct) {
              selectedProduct = data.selectedProduct;
              
              // If we only have ID, fetch full product
              if (selectedProduct._id && !selectedProduct.name) {
                const productResponse = await fetch(`/api/products/${selectedProduct._id}`);
                const productData = await productResponse.json();
                if (productData.product) {
                  selectedProduct = productData.product;
                }
              }
              
              setSelectedProduct(selectedProduct);
              break;
            }
          } catch (err) {
            console.log(`Attempt ${retries + 1} failed`);
          }
          
          retries++;
          if (retries < 3) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Load other data in parallel
        const [heroResponse, deliveryResponse] = await Promise.allSettled([
          fetch('/api/hero'),
          fetch('/api/delivery')
        ]);
        
        if (heroResponse.status === 'fulfilled') {
          const heroData = await heroResponse.value.json();
          setHeroData(heroData);
        }
        
        if (deliveryResponse.status === 'fulfilled') {
          const deliveryData = await deliveryResponse.value.json();
          setDeliveryCharge(deliveryData);
        }
        
        // If still no product, show fallback UI
        if (!selectedProduct) {
          setError('Product not available. Please try refreshing.');
        }
        
      } catch (err) {
        console.error('Error:', err);
        setError('Loading... Please wait a moment and refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchDataIncrementally();

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
  if (error && !selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Product Loading Issue</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No product selected but we have hero data - show something
  if (!selectedProduct && heroData) {
    return (
      <div className="min-h-screen bg-gray-200 text-gray-800 font-sans">
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeIn()}
          className="text-center bg-red-600 text-white py-8 rounded-b-3xl shadow-lg"
        >
          <h1 className="text-xl md:text-2xl font-bold mb-3">
            {heroData.mainTitle || 'Store Coming Soon'}
          </h1>
          <p className="mt-5">Please check back soon for our products!</p>
        </motion.section>
        
        <div className="text-center mt-8">
          <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
            <p className="text-gray-600">No product is currently selected.</p>
            <p className="text-sm text-gray-500 mt-2">Admin needs to select a product first.</p>
          </div>
        </div>
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