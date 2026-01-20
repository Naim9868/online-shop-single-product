// app/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductShowcase from '@/components/ProductShowcase';
import OrderForm from '@/components/OrderForm';

// In-memory cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (key, fetchFn) => {
  const cached = apiCache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const data = await fetchFn();
    apiCache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    // Return stale cache if available
    if (cached) {
      console.warn(`Using stale cache for ${key}`);
      return cached.data;
    }
    throw error;
  }
};

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

  // Optimized data fetching - loads hero first, then product
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch hero data first (smallest, fastest to load)
        const heroPromise = fetchWithCache('hero', async () => {
          const res = await fetch('/api/hero');
          if (!res.ok) throw new Error('Hero API failed');
          return res.json();
        });

        // Fetch selected product ID (small data)
        const selectedPromise = fetchWithCache('selected-product', async () => {
          const res = await fetch('/api/selected-product');
          if (!res.ok) {
            // If 500 error, try to get at least the product ID
            const fallbackRes = await fetch('/api/selected-product', {
              headers: { 'Cache-Control': 'no-cache' }
            });
            if (!fallbackRes.ok) throw new Error('Selected product API failed');
            return fallbackRes.json();
          }
          return res.json();
        });

        // Wait for initial critical data
        const [heroResponse, selectedResponse] = await Promise.allSettled([
          heroPromise,
          selectedPromise
        ]);

        if (!mounted) return;

        // Set hero data immediately (shows first)
        if (heroResponse.status === 'fulfilled') {
          setHeroData(heroResponse.value);
        }

        // Handle selected product
        if (selectedResponse.status === 'fulfilled' && 
            selectedResponse.value.selectedProduct?._id) {
          
          const productId = selectedResponse.value.selectedProduct._id;
          
          // Fetch product details with cache
          const productDetails = await fetchWithCache(
            `product-${productId}`,
            async () => {
              const res = await fetch(`/api/products/${productId}`);
              if (!res.ok) {
                // Try one more time without cache
                const fallbackRes = await fetch(`/api/products/${productId}`, {
                  headers: { 'Cache-Control': 'no-cache' }
                });
                if (!fallbackRes.ok) throw new Error('Product details API failed');
                return fallbackRes.json();
              }
              return res.json();
            }
          );
          
          if (mounted) {
            setSelectedProduct(productDetails.product);
            setLoading(false); // Show page with product
          }

          // Load remaining data in background
          if (mounted) {
            Promise.allSettled([
              fetchWithCache('products', async () => {
                const res = await fetch('/api/products');
                if (!res.ok) throw new Error('Products API failed');
                return res.json();
              }),
              fetchWithCache('delivery', async () => {
                const res = await fetch('/api/delivery');
                if (!res.ok) throw new Error('Delivery API failed');
                return res.json();
              })
            ]).then(([productsRes, deliveryRes]) => {
              if (mounted) {
                if (productsRes.status === 'fulfilled') {
                  setProducts(productsRes.value.products || []);
                }
                if (deliveryRes.status === 'fulfilled') {
                  setDeliveryCharge(deliveryRes.value);
                }
              }
            });
          }
          
        } else {
          // No selected product found
          if (mounted) {
            setLoading(false);
          }
        }

      } catch (err) {
        if (mounted) {
          console.error('Error fetching data:', err);
          setError(`Failed to load data: ${err.message || err}`);
          setLoading(false);
        }
      }
    };

    // Add small delay to prevent loading flash
    timeoutId = setTimeout(() => {
      fetchInitialData();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // Get final hero data (product heroData overrides global heroData)
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

  // Loading state - shows minimal skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200">
        {/* Hero loading skeleton */}
        <div className="h-40 bg-gradient-to-r from-red-500 to-red-600 animate-pulse rounded-b-3xl"></div>
        
        {/* Minimal product skeleton */}
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-white rounded-xl p-6 mt-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-300 rounded-lg"></div>
              <div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-10 bg-red-400 rounded w-1/2 mt-8"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No product selected state
  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">No Product Selected</h2>
            <p className="text-sm">Please select a product from the admin panel first.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-800 font-sans">
      {/* Hero Section */}
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

      {/* Product Showcase Component */}
      <ProductShowcase
        onOrderClick={scrollToOrderForm}
        product={selectedProduct}
      />

      {/* Order Form Section */}
      <div id="order-form-section">
        <OrderForm
          product={selectedProduct}
          onOrderDataChange={handleOrderData}
          selectedSize={selectedSize}
          shippingMethod={shippingMethod}
          deliveryCharge={deliveryCharge}
        />
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