// components/OrderForm.jsx - Production Ready
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import OrderSummary from "./OrderSummary";
import { User, Phone, MapPin, Package, Truck, Flag, Mail, Shield, AlertCircle } from 'lucide-react';

export default function OrderForm({
  product,
  onOrderDataChange,
  selectedSize = "M",
  shippingMethod = "",
  deliveryCharge,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [orderData, setOrderData] = useState({
    name: "",
    phone_1: "",
    phone_2: "",
    email: "",
    district: "",
    address: "",
    productCount: 1,
    size: selectedSize,
    shipping: "", // Empty by default - user must select
  });

  const [subtotal, setSubtotal] = useState(0);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isMessage, setIsMessage] = useState(false);

  // Animation variants
  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  });

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Memoized shipping options
  const shippingOptions = useMemo(() => [
    { 
      value: 'inside-city', 
      label: deliveryCharge?.insideCity || 'Inside City', 
      price: parseInt(deliveryCharge?.insideCost || 0)
    },
    { 
      value: 'outside-city', 
      label: deliveryCharge?.outsideCity || 'Outside City', 
      price: parseInt(deliveryCharge?.outsideCost || 0)
    }
  ], [deliveryCharge]);

  // Calculate shipping cost only when shipping is selected
  const shippingCost = useMemo(() => {
    if (!orderData.shipping) return 0;
    const selectedOption = shippingOptions.find(option => option.label === orderData.shipping);
    return selectedOption ? selectedOption.price : 0;
  }, [orderData.shipping, shippingOptions]);

  const total = subtotal + shippingCost;

  // Update local state when props change
  useEffect(() => {
    setOrderData(prev => ({
      ...prev,
      size: selectedSize,
    }));
  }, [selectedSize]);

  // Calculate subtotal
  useEffect(() => {
    if (product?.price && orderData.productCount) {
      setSubtotal(product.price * orderData.productCount);
    }
  }, [orderData.productCount, product]);

  // Validate form fields
  const validateField = useCallback((name, value) => {
    const errors = { ...formErrors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) errors.name = 'Name is required';
        else if (value.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        else delete errors.name;
        break;
      
      case 'phone_1':
        const phoneRegex = /^[0-9]{11}$/;
        if (!value) errors.phone_1 = 'Primary phone is required';
        else if (!phoneRegex.test(value)) errors.phone_1 = 'Enter a valid 11-digit number';
        else delete errors.phone_1;
        break;
      
      case 'phone_2':
        if (value && !/^[0-9]{11}$/.test(value)) {
          errors.phone_2 = 'Enter a valid 11-digit number';
        } else {
          delete errors.phone_2;
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      
      case 'district':
        if (!value) errors.district = 'Please select a division';
        else delete errors.district;
        break;
      
      case 'address':
        if (!value.trim()) errors.address = 'Address is required';
        else if (value.trim().length < 5) errors.address = 'Address must be at least 10 characters';
        else delete errors.address;
        break;
      
      case 'shipping':
        if (!value) errors.shipping = 'Please select a shipping method';
        else delete errors.shipping;
        break;
      
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formErrors]);

  // Handle input changes with validation
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...orderData,
      [name]: name === 'productCount' ? Math.max(1, parseInt(value) || 1) : value,
    };
    
    setOrderData(updatedData);
    validateField(name, value);

    // Notify parent when all required fields are filled
    const requiredFields = ['name', 'phone_1', 'address', 'district', 'size', 'shipping'];
    const allRequiredFilled = requiredFields.every(field => 
      field === 'shipping' ? updatedData.shipping : updatedData[field]?.trim()
    );

    if (allRequiredFilled && product) {
      onOrderDataChange?.({
        ...updatedData,
        subtotal,
        shippingCost,
        totalCost: total
      });
    }
  }, [orderData, product, subtotal, shippingCost, total, onOrderDataChange, validateField]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const fieldsToValidate = ['name', 'phone_1', 'district', 'address', 'shipping'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, orderData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  }, [orderData, validateField]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        name: orderData.name.trim(),
        phone_1: orderData.phone_1,
        phone_2: orderData.phone_2?.trim() || '',
        email: orderData.email?.trim() || '',
        district: orderData.district,
        address: orderData.address.trim(),
        size: orderData.size,
        productCount: orderData.productCount,
        shipping: orderData.shipping,
        subtotal: subtotal,
        shippingCost: shippingCost,
        totalCost: total
      };
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();

      if (response.ok) {
        setOrderSuccess('Order placed successfully! We will contact you soon.');
        // Reset form
        setOrderData({
          name: "",
          phone_1: "",
          phone_2: "",
          email: "",
          district: "",
          address: "",
          productCount: 1,
          size: selectedSize,
          shipping: "",
        });
        setFormErrors({});
      } else {
        setOrderSuccess(result.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
      setIsMessage(true);
    }
  };

  // Show loading if essential data isn't available
  if (!deliveryCharge || !product) {
    return (
      <div className="min-h-screen mt-8 bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-2 bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <motion.section
        variants={fadeIn(0.3)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          variants={itemAnimation}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-2xl mb-4 shadow-lg"
          >
            <h2 className="text-2xl font-bold">{product.heroData?.mainTitle || product.name}</h2>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Form</h1>
          <p className="text-gray-600">Fill in your details to complete the order</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            variants={staggerChildren}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-3xl shadow-xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Billing Details</h3>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <motion.div variants={itemAnimation} className="space-y-2">
                <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={orderData.name}
                  onChange={handleInputChange}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all duration-200 ${
                    formErrors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
                {formErrors.name && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </motion.div>

              {/* Country Field */}
              <motion.div variants={itemAnimation} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Flag className="w-4 h-4" />
                  Country / Region *
                </label>
                <div className="w-full border-2 border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-gray-700">
                  Bangladesh
                </div>
              </motion.div>

              {/* Phone Numbers */}
              <motion.div variants={itemAnimation} className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4" />
                  Phone Numbers(ফোন নাম্বার) *
                </label>
                
                <div className="space-y-3">
                  <input
                    type="tel"
                    name="phone_1"
                    value={orderData.phone_1}
                    onChange={handleInputChange}
                    pattern="[0-9]{11}"
                    placeholder="Primary: 01701010101"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    title="11 digits only"
                    required
                  />
                  
                  <input
                    type="tel"
                    name="phone_2"
                    value={orderData.phone_2}
                    onChange={handleInputChange}
                    pattern="[0-9]{11}"
                    placeholder="Secondary: 01801010101"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    title="11 digits only"
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemAnimation} className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4" />
                  Email Address(ইমেইল)
                </label>
                
                <div className="space-y-3">
                  <input
                    type="email"
                    name="email"
                    value={orderData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    title="Enter a valid email address"
                  />
                </div>
              </motion.div>

              {/* District */}
              <motion.div variants={itemAnimation} className="space-y-2">
                <label htmlFor="district" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4" />
                  Division(বিভাগ) *
                </label>
                <select
                  id="district"
                  name="district"
                  value={orderData.district}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  required
                >
                  <option value="">Select Division</option>
                  <option value="dhaka">Dhaka</option>
                  <option value="chattogram">Chattogram</option>
                  <option value="sylhet">Sylhet</option>
                  <option value="rajshahi">Rajshahi</option>
                  <option value="khulna">Khulna</option>
                  <option value="barishal">Barishal</option>
                  <option value="rangpur">Rangpur</option>
                  <option value="mymensingh">Mymensingh</option>
                </select>
              </motion.div>

              {/* Address */}
              <motion.div variants={itemAnimation} className="space-y-2">
                <label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="w-4 h-4" />
                  Full Address (ঠিকানা) *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={orderData.address}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 resize-none"
                  placeholder="Enter your complete address"
                  required
                />
              </motion.div>

              {/* Size Selection */}
              <motion.div variants={itemAnimation} className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package className="w-4 h-4" />
                  Size (সাইজ) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <motion.label
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center justify-center p-4 border-2 rounded-xl font-semibold cursor-pointer transition-all duration-200 ${
                        orderData.size === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        required
                        checked={orderData.size === size}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      {size}
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              {/* Product Count */}
              <motion.div variants={itemAnimation} className="space-y-2">
                <label htmlFor="productCount" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package className="w-4 h-4" />
                  Product Count (পণ্যের পরিমাণ) *
                </label>
                <input
                  type="number"
                  id="productCount"
                  name="productCount"
                  min="1"
                  max="9"
                  value={orderData.productCount}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                  required
                />
              </motion.div>
              {/* Phone, Email, District, Address, Size, Product Count */}

              {/* Shipping Method */}
              <motion.div variants={itemAnimation} className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Truck className="w-4 h-4" />
                  Shipping Method *
                </label>
                {formErrors.shipping && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.shipping}
                  </p>
                )}
                <div className="space-y-2">
                  {shippingOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        orderData.shipping === option.label
                          ? 'border-green-500 bg-green-50'
                          : formErrors.shipping 
                            ? 'border-red-200'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.label}
                          checked={orderData.shipping === option.label}
                          onChange={handleInputChange}
                          className="text-green-500 focus:ring-green-500"
                          required
                        />
                        <span className="font-medium text-gray-800">{option.label}</span>
                      </div>
                      <span className="font-semibold text-gray-700">৳{option.price}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            </form>
          </motion.div>

          {/* Order Summary Section */}
          <motion.div
            variants={fadeIn(0.8)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <OrderSummary
              orderData={{
                ...orderData,
                subtotal: subtotal,
                shippingCost: shippingCost,
                totalCost: total
              }}
              product={product}
              deliveryCharge={deliveryCharge}
            />
            
            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(formErrors).length > 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-bold shadow-lg transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Order...
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg">Place Order Now</div>
                  <div className="text-sm opacity-90 mt-1">Total: ৳{total}</div>
                </div>
              )}
            </motion.button>

            {/* Security & Trust Badges */}
            <motion.div
              variants={itemAnimation}
              className="text-center mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-blue-700">
                <Shield className="w-4 h-4" />
                100% Secure
              </div>
             { isMessage && orderSuccess && (
               <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {orderSuccess}
              </div>
            )}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}