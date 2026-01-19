'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductShowcase from '@/components/ProductShowcase';
import OrderForm from '@/components/OrderForm';

export default function HomeClient({ initialData }) {
  const {
    products,
    selectedProduct: initialSelectedProduct,
    hero,
    delivery,
  } = initialData;

  const [selectedProduct] = useState(initialSelectedProduct);
  const [heroData] = useState(hero);
  const [deliveryCharge] = useState(delivery);
  const [shippingMethod, setShippingMethod] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [billingInfo, setBillingInfo] = useState({});

  // Memoized scroll function
  const scrollToOrderForm = useCallback(() => {
    const orderFormElement = document.getElementById('order-form-section');
    if (orderFormElement) {
      orderFormElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  // Order data handling with validation
  const handleOrderData = useCallback(
    (data) => {
      const updated = { ...billingInfo, ...data };
      setBillingInfo(updated);

      if (data.shipping) {
        setShippingMethod(data.shipping);
      }
      if (data.size) {
        setSelectedSize(data.size);
      }
    },
    [billingInfo]
  );

  // Animation variants
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    },
  });

  // Get final hero data (product heroData overrides global heroData)
  const finalHeroData = selectedProduct?.heroData
    ? { ...heroData, ...selectedProduct.heroData }
    : heroData;

  // No product selected state
  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-200 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-semibold mb-2">No Product Selected</h2>
            <p className="text-sm">
              Please select a product from the admin panel first.
            </p>
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
            {finalHeroData?.buttonText || 'Special Offer'} ৳
            {finalHeroData?.currentPrice || '990'}
          </span>
        </div>

        <button
          onClick={scrollToOrderForm}
          className="mt-5 bg-white text-red-600 font-semibold px-8 py-2 rounded-xl shadow-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
        >
          অর্ডার করতে চাই
        </button>
      </motion.section>

      {/* Product Showcase */}
      <ProductShowcase
        onOrderClick={scrollToOrderForm}
        product={selectedProduct}
      />

      {/* Order Form */}
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
          <p className="mt-2 text-xs text-gray-500">
            Secure payment processing | Fast delivery
          </p>
        </div>
      </footer>
    </div>
  );
}
