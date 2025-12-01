// app/page.js/
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

  // Fetch all data in parallel for better performance
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [productsResponse, selectedResponse, heroResponse, deliveryResponse] = await Promise.all([
          fetch('/api/products').then(res => res.ok ? res.json() : Promise.reject('Products API failed')),
          fetch('/api/selected-product').then(res => res.ok ? res.json() : Promise.reject('Selected product API failed')),
          fetch('/api/hero').then(res => res.ok ? res.json() : Promise.reject('Hero API failed')),
          fetch('/api/delivery').then(res => res.ok ? res.json() : Promise.reject('Delivery API failed'))
        ]);

        // Set states
        setProducts(productsResponse.products || []);
        setHeroData(heroResponse);
        setDeliveryCharge(deliveryResponse);

        // Fetch selected product details if available
        if (selectedResponse.selectedProduct?._id) {
          const productResponse = await fetch(`/api/products/${selectedResponse.selectedProduct._id}`);
          if (productResponse.ok) {
            const productData = await productResponse.json();
            setSelectedProduct(productData.product);
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
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

  // Debug useEffect
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('Selected product updated:', selectedProduct);
  //     console.log('All products:', products);
  //     console.log('Hero data:', heroData);
  //     console.log('Delivery charge:', deliveryCharge);
  //   }
  // }, [selectedProduct, products, heroData, deliveryCharge]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load our products</p>
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