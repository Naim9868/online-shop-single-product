// components/ProductShowcase.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star, Check, Truck, Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageSlider from './ImageSlider';


export default function ProductShowcase({ product, onOrderClick }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const fadeIn = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
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
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  // Fallback if product data is not available
  if (!product) {
    return (
      <div className="text-center py-8 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  const {
    name,
    price,
    description,
    features = [],
    sizes = [],
    images = [],
    sizeChart = [],
    productDetails = {}
  } = product;

  // Use product images or fallback to default images
  const productImages = images.length > 0 ? images : [
    "https://fabrilife.com/products/628f71c9a6ae3-square.jpg?v=20",
    "/images/t-shirt_2.jpg", 
    "/images/t-shirt_3.jpg"
  ];

  // Image navigation functions
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
    setImageLoading(true);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
    setImageLoading(true);
  };

  return (
    <div className="min-h-screen mt-1 bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      

      {/* Product Image Slider */ }
      <motion.section
        variants={fadeIn(0.2)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-8 space-y-4 text-center"
      >
        <div className="flex justify-center">
          <img
            src={images[0] || "/images/t-shirt_1.jpg"}
            alt="Product 1" 
            width={350}
            height={400}
            className="rounded-2xl shadow-md w-[90%] sm:w-[350px] mx-auto"
          />
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          <img
            src={images[1] || "/images/t-shirt_2.jpg"}
            alt="Product 2"
            width={160}
            height={180}
            className="rounded-xl shadow w-[45%] sm:w-[160px]"
          />
          <img
            src={images[2] || "/images/t-shirt_3.jpg"}
            alt="Product 3"
            width={160}
            height={180}
            className="rounded-xl shadow w-[45%] sm:w-[160px]"
          />
        </div>
        <button 
          onClick={onOrderClick}
          className="mt-3 bg-red-600 text-sm text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-red-700 transition"
        >
          <a href='#order-form'>অর্ডার করতে চাই</a>
        </button>
      </motion.section>

      {/* Measurement Table */}
      {/* <motion.section
        variants={fadeIn(0.3)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mt-10 mx-4 bg-white shadow-lg rounded-2xl p-4 sm:p-6"
      ></motion.section> */}
      
      {/* Product Header - Mobile Optimized */}
      <motion.div
        variants={fadeIn(0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="text-center mb-6 sm:mb-8 px-2"
      >
        <h1 className="text-xl mt-3 sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 leading-tight">
          {name}
        </h1>
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
          <span className="text-xl sm:text-3xl font-bold text-red-600">৳{price}</span>
          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
          </div>
        </div>
        <p className="text-gray-700 text-left text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:px-20 lg:gap-12">
        {/* Product Images - Mobile First */}
        <motion.section
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-2 max-w-4xl mx-auto"
        >
          {/* image slider component */}
          <ImageSlider
            images={images.length > 0 ? images : productImages}
            productDetails={productDetails}
            productFeatures={features}
          />


          {/* Quick Order Button - Mobile Full Width */}
          <motion.button
            variants={itemAnimation}
            onClick={onOrderClick}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-base sm:text-lg"
          >
            🛒 অর্ডার করতে চাই - ৳{price}
          </motion.button>

          {/* Trust Badges - Mobile Grid */}
          <motion.div
            variants={itemAnimation}
            className="grid grid-cols-3 gap-2 sm:gap-3 text-center"
          >
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-100">
              <Truck className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-blue-700 leading-tight">Fast Delivery</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-green-700 leading-tight">Quality Guarantee</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 sm:p-3 border border-purple-100">
              <RefreshCw className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-purple-700 leading-tight">Easy Return</p>
            </div>
          </motion.div>
        </motion.section>

        {/* Product Details - Mobile Stacked */}
        <motion.section
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Features */}
          <motion.div
            variants={itemAnimation}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              Product Features
            </h2>
            <ul className="space-y-2 sm:space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* Size Chart - Mobile Scrollable */}
          <motion.div
            variants={itemAnimation}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Size Chart (সাইজ চার্ট)</h2>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden min-w-max">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="py-2 sm:py-3 px-3 sm:px-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Size</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Chest</th>
                    <th className="py-2 sm:py-3 px-3 sm:px-4 text-left font-semibold text-gray-700 text-xs sm:text-sm">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((size, index) => (
                    <tr key={size._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 font-semibold text-gray-800 text-xs sm:text-sm">{size.size}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-xs sm:text-sm">{size.chest}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-600 text-xs sm:text-sm">{size.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">* All measurements are in inches</p>
          </motion.div>

          {/* Product Details - Mobile Grid */}
          <motion.div
            variants={itemAnimation}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Product Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Collection</h3>
                <p className="text-gray-600 text-sm sm:text-base">{productDetails.collection || 'Premium Collection'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Fabric</h3>
                <p className="text-gray-600 text-sm sm:text-base">{productDetails.fabric || 'High Quality Cotton'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Style</h3>
                <p className="text-gray-600 text-sm sm:text-base">{productDetails.style || 'Casual'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">Gender</h3>
                <p className="text-gray-600 text-sm sm:text-base">{productDetails.gender || 'Men'}</p>
              </div>
            </div>
          </motion.div>

          {/* Available Sizes - Mobile Wrap */}
          <motion.div
            variants={itemAnimation}
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Available Sizes</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {sizes.map((size) => (
                <div
                  key={size}
                  className="bg-gray-100 text-gray-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold border-2 border-transparent hover:border-red-500 transition-colors text-sm sm:text-base"
                >
                  {size}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA - Mobile Optimized */}
          <motion.button
            variants={itemAnimation}
            onClick={onOrderClick}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-base sm:text-lg"
          >
            ✅ Order Now - Limited Stock!
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
}