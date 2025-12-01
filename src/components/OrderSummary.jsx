


 // components/OrderSummary.jsx
"use client";
import { motion } from 'framer-motion';
// import { useOrderData } from '@/context/OrderContext';
import { Truck, Package, CreditCard } from 'lucide-react';

export default function OrderSummary({
   product,
   orderData
}) {
  // const {orderData} = useOrderData();

  // console.log("Order Data in Summary:", orderData);

  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  });

  const { name, price } = product || {};
  const pricePerProduct = price || 0;
  const { shipping, shippingCost, totalCost, subtotal, productCount} = orderData || {};
  
  return (
    <div className="order-summary">
      {/* Order Summary */}
      <motion.section
        variants={fadeIn(0.5)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h5 className="text-xl font-bold text-gray-800">Order Summary</h5>
        </div>

        {/* Product Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between gap-3 items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-600">Product</span>
            <span className="text-sm font-semibold text-gray-800">{name} × {productCount}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center p-1 md:p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500">Price Each</span>
              <span className="text-sm font-semibold">৳{pricePerProduct}</span>
            </div>
            <div className="flex justify-between items-center p-1 md:p-3 bg-white rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500">Subtotal</span>
              <span className="text-sm font-semibold">৳{subtotal}</span>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Shipping</span>
          </div>
          <div className="text-right">
            <div className="text-xs md:text-sm font-semibold text-gray-800 capitalize">{shipping}</div>
            <div className="text-sm text-gray-600">৳{shippingCost}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-sm text-gray-500">Total Amount</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">৳{totalCost}</span>
            <div className="text-xs text-gray-500 mt-1">Including all</div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
        >
          <CreditCard className="w-5 h-5" />
          <span>Cash on Delivery</span>
          <span className="ml-auto">৳{totalCost}</span>
        </motion.button>

        {/* Security Badge */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
             100% trusted
          </div>
        </div>
      </motion.section>
    </div>
  );
}