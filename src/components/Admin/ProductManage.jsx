// components/Admin/ProductManager.jsx

import { InspectIcon } from 'lucide-react';
import { set } from 'mongoose';
import { useState, useEffect } from 'react';

export default function ProductManager() {
  // State for managing products
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // State for hero section management
  const [heroData, setHeroData] = useState({
    mainTitle: '৩ পিস ইউনিক ফুল স্লিভ প্রিন্টেড শোল্ডার টি-শার্ট মাত্র ৯৯০ টাকা',
    originalPrice: '2000',
    currentPrice: '990',
    buttonText: 'আগের মূল্য (৩ পিস)'
  });

  const [deliveryCharge, setDeliveryCharge] = useState({
    insideCity: "inside dhaka",
    outsideCity: "outside dhaka",
    insideCost: "60",
    outsideCost: "120"
  });

  // Main form data for product management
  const [formData, setFormData] = useState({
    // Basic product info
    name: '',
    price: '',
    description: '',
    
    // Hero section specific (can override global hero)
    heroMainTitle: '',
    heroOriginalPrice: '',
    heroCurrentPrice: '',
    heroButtonText: '',
    
    // Product features
    features: [''],
    
    // Available sizes
    sizes: ['M', 'L', 'XL', '2XL'],
    
    // Image URLs
    images: [''],
    mainImage: '',
    
    // Size chart data
    sizeChart: [
      { size: 'M', chest: '40"', length: '27"' },
      { size: 'L', chest: '42"', length: '28"' },
      { size: 'XL', chest: '44"', length: '29"' },
      { size: '2XL', chest: '46"', length: '30"' }
    ],
    
    // Product description details
    productDetails: {
      product_collection: 'Summer Collection',
      fabric: 'Imported Chine Mash',
      style: 'Casual',
      gender: 'Men'
    }
  });

  // Load initial data when component mounts
  useEffect(() => {
    initialSelectedProduct();
    loadProducts();
    loadHeroData();
  }, []);

  // Load products from API
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);    
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };
  //initial selected product id loading
  const initialSelectedProduct = async () => {
    try {
      const response = await fetch('/api/selected-product');
      const data = await response.json();
      setSelectedProductId(data.selectedProduct._id);   
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Load hero section data (you might want to store this separately)
  const loadHeroData = async () => {
    try {
      // You can create a separate API for hero data or store it with products
      const response = await fetch('/api/hero');
      const data = await response.json();
      if (data) setHeroData(data);
    } catch (error) {
      console.log('Using default hero data');
    }
  };

  // Handle form submission for both new and edited products
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare product data for API
    const productData = {
      ...formData,
      price: parseInt(formData.price),
      features: formData.features.filter(f => f.trim() !== ''),
      images: formData.images.filter(img => img.trim() !== ''),
      // If hero fields are filled, use them, otherwise use global hero data
      heroData: formData.heroMainTitle ? {
        mainTitle: formData.heroMainTitle,
        originalPrice: formData.heroOriginalPrice,
        currentPrice: formData.heroCurrentPrice,
        buttonText: formData.heroButtonText
      } : null
    };

    try {
      const url = editingProduct ? `/api/products` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct 
          ? { id: editingProduct._id, ...productData }
          : productData
        )
      });

      if (response.ok) {
        await loadProducts();
        resetForm();
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      heroMainTitle: '',
      heroOriginalPrice: '',
      heroCurrentPrice: '',
      heroButtonText: '',
      features: [''],
      sizes: ['M', 'L', 'XL', '2XL'],
      images: [''],
      mainImage: '',
      sizeChart: [
        { size: 'M', chest: '40"', length: '27"' },
        { size: 'L', chest: '42"', length: '28"' },
        { size: 'XL', chest: '44"', length: '29"' },
        { size: '2XL', chest: '46"', length: '30"' }
      ],
      productDetails: {
        product_collection: 'Summer Collection',
        fabric: 'Imported Chine Mash',
        style: 'Casual',
        gender: 'Men'
      }
    });
    setEditingProduct(null);
  };

  // Select product for frontend display
const selectProduct = async (productId) => {
  try {
    const response = await fetch('/api/selected-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    if (response.ok) {
      setSelectedProductId(productId);
      alert('Product selected for display!');
      
    } else {
      alert('Error selecting product');
    }
  } catch (error) {
    console.error('Error selecting product:', error);
    alert('Error selecting product');
  }
};

// useEffect(() => {
//   if (selectedProductId) {
//     console.log('Selected product ID set to:', selectedProductId);
//   }
// }, [selectedProductId]);

  // Delete product
  const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (response.ok) {
          await loadProducts();
          alert('Product deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  // Edit product - load existing data into form
  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      heroMainTitle: product.heroData?.mainTitle || '',
      heroOriginalPrice: product.heroData?.originalPrice || '',
      heroCurrentPrice: product.heroData?.currentPrice || '',
      heroButtonText: product.heroData?.buttonText || '',
      features: product.features.length ? product.features : [''],
      sizes: product.sizes || ['M', 'L', 'XL', '2XL'],
      images: product.images?.length ? product.images : [''],
      mainImage: product.mainImage || '',
      sizeChart: product.sizeChart || [
        { size: 'M', chest: '40"', length: '27"' },
        { size: 'L', chest: '42"', length: '28"' },
        { size: 'XL', chest: '44"', length: '29"' },
        { size: '2XL', chest: '46"', length: '30"' }
      ],
      productDetails: product.productDetails || {
        product_collection: 'Summer Collection',
        fabric: 'Imported Chine Mash',
        style: 'Casual',
        gender: 'Men'
      }
    });
    console.log("Editing product:", product);
  };

  // Update hero section globally
  const updateHeroData = async () => {
    // console.log("heroData:", heroData);
    try {
      const response = await fetch('/api/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });
      
      if (response.ok) {
        alert('Hero section updated successfully!');
      }
    } catch (error) {
      console.error('Error updating hero data:', error);
      alert('Error updating hero section. Please try again.');
    }
  };
  
  // Update delivery charge data
  const updateDeliveryCharge = async () => {
    // console.log("deliveryCharge:", deliveryCharge);
    try {
      const response = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryCharge)
      });
      
      if (response.ok) {
        alert('Delivery charge data updated successfully!');
      }
    } catch (error) {
      console.error('Error updating delivery charge data:', error);
      alert('Error updating delivery charge section. Please try again.');
    }
  };

  // Helper function to update array fields (features, images, etc.)
  const updateArrayField = (fieldName, index, value) => {
    const newArray = [...formData[fieldName]];
    newArray[index] = value;
    setFormData({ ...formData, [fieldName]: newArray });
  };

  // Add new item to array fields
  const addArrayFieldItem = (fieldName) => {
    setFormData({ 
      ...formData, 
      [fieldName]: [...formData[fieldName], ''] 
    });
  };

  // Remove item from array fields
  const removeArrayFieldItem = (fieldName, index) => {
    const newArray = formData[fieldName].filter((_, i) => i !== index);
    setFormData({ ...formData, [fieldName]: newArray });
  };

  // Update size chart data
  const updateSizeChart = (index, field, value) => {
    const newSizeChart = [...formData.sizeChart];
    newSizeChart[index] = { ...newSizeChart[index], [field]: value };
    setFormData({ ...formData, sizeChart: newSizeChart });
  };

  return (
    <div className="admin-dashboard text-gray-500 p-6 max-w-7xl mx-auto">
      {/* Hero Section Manager */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Hero Section Manager</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Title
            </label>
            <input
              type="text"
              value={heroData.mainTitle}
              onChange={(e) => setHeroData({...heroData, mainTitle: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter main hero title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (with ৳ symbol)
            </label>
            <input
              type="text"
              value={heroData.originalPrice}
              onChange={(e) => setHeroData({...heroData, originalPrice: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="2000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Price (with ৳ symbol)
            </label>
            <input
              type="text"
              value={heroData.currentPrice}
              onChange={(e) => setHeroData({...heroData, currentPrice: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="990"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer text
            </label>
            <input
              type="text"
              value={heroData.buttonText}
              onChange={(e) => setHeroData({...heroData, buttonText: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="আগের মূল্য (৩ পিস)"
            />
          </div>
        </div>
        <button
          onClick={updateHeroData}
          className="mt-4 bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Update Hero Section
        </button>
      </div>
      {/* deliveryCost setup */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Delivery Cost Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inside City
            </label>
            <input
              type="text"
              value={deliveryCharge.insideCity}
              onChange={(e) => setDeliveryCharge({...deliveryCharge, insideCity : e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter main hero title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outside City
            </label>
            <input
              type="text"
              value={deliveryCharge.outsideCity}
              onChange={(e) => setDeliveryCharge({...deliveryCharge, outsideCity : e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="2000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost For Inside City
            </label>
            <input
              type="text"
              value={deliveryCharge.insideCost}
              onChange={(e) => setDeliveryCharge({...deliveryCharge, insideCost : e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="990"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost For Outside City
            </label>
            <input
              type="text"
              value={deliveryCharge.outsideCost}
              onChange={(e) => setDeliveryCharge({...deliveryCharge, outsideCost : e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="অর্ডার করতে চাই"
            />
          </div>
        </div>
        <button
          onClick={updateDeliveryCharge}
          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Update Delivery Cost
        </button>
      </div>

      {/* Product Form Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Premium Full Sleeve T-Shirts - 3 Pcs Package"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (৳) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="990"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              rows="3"
              placeholder="Summer Collection - Imported Chine Mash Fabric"
              required
            />
          </div>

          {/* Product-specific Hero Override (Optional) */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Product-specific Hero Settings (Optional)</h3>
            <p className="text-sm text-gray-600 mb-3">These will override the global hero settings for this product only</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Hero Title
                </label>
                <input
                  type="text"
                  value={formData.heroMainTitle}
                  onChange={(e) => setFormData({...formData, heroMainTitle: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Leave empty to use global hero title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Current Price
                </label>
                <input
                  type="text"
                  value={formData.heroCurrentPrice}
                  onChange={(e) => setFormData({...formData, heroCurrentPrice: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="990"
                />
              </div>
            </div>
          </div>

          {/* Features Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateArrayField('features', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter a feature"
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayFieldItem('features', index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayFieldItem('features')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Add Feature
            </button>
          </div>

          {/* Images Management */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images URLs
            </label>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => updateArrayField('images', index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayFieldItem('images', index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                              Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayFieldItem('images')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Add Image URL
            </button>
          </div>

          {/* Size Chart Management */}
          <div>
            <label className="block mb-6 text-center text-sm font-medium text-gray-700 ">
              <div>Size Chart</div>
            </label>
            <div className='flex flex-row justify-between w-full font-semibold'>
                <div>Size</div>
                <div>Chest</div>
                <div>Length</div>
            </div>
            <div className="space-y-3">
              {formData.sizeChart.map((sizeData, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                
                  <input
                    type="text"
                    value={sizeData.size}
                    onChange={(e) => updateSizeChart(index, 'size', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Size (e.g., M)"
                  />
                 
                  <input
                    type="text"
                    value={sizeData.chest}
                    onChange={(e) => updateSizeChart(index, 'chest', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Chest (e.g., 40')"
                  />

                  <input
                    type="text"
                    value={sizeData.length}
                    onChange={(e) => updateSizeChart(index, 'length', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Length (e.g., 27')"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                            Collection Name
              </label>
              <input
                type="text"
                value={formData.productDetails.product_collection}
                onChange={(e) => setFormData({
                  ...formData, 
                  productDetails: {...formData.productDetails, product_collection: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Summer Collection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fabric Type
              </label>
              <input
                type="text"
                value={formData.productDetails.fabric}
                onChange={(e) => setFormData({
                  ...formData, 
                  productDetails: {...formData.productDetails, fabric: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Imported Chine Mash"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Style
              </label>
              <input
                type="text"
                value={formData.productDetails.style}
                onChange={(e) => setFormData({
                  ...formData, 
                  productDetails: {...formData.productDetails, style: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Casual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Gender
              </label>
              <input
                type="text"
                value={formData.productDetails.gender}
                onChange={(e) => setFormData({
                  ...formData, 
                  productDetails: {...formData.productDetails, gender: e.target.value}
                })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Men"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Products ({products.length})
        </h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products found. Add your first product above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
            
              >
                <div className="product-info mb-4 flex flex-row justify-between">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
                        <p className="text-green-600 font-bold text-xl mb-2">৳{product.price}</p>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-1">
                          {product.sizes?.map(size => (
                            <span key={size} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {size}
                            </span>
                          ))}
                        </div>
                    </div> 
                    <div>
                      {selectedProductId === product._id && (
                        <InspectIcon className="w-6 h-6 text-blue-500 mb-2" />
                      )}
                    </div>
                    <div>
                      {product.images && product.images.length > 0 && (
                        <img 
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-30 object-cover rounded mb-1"
                        />
                      )}
                    </div>

                </div>

                  <div className="product-actions flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent div onClick from firing
                        selectProduct(product._id);
                      }}
                      className={`flex-1 py-2 px-3 rounded transition-colors text-sm ${
                        selectedProductId === product._id 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-300 text-white hover:bg-green-400'
                      }`}
                    >
                      {selectedProductId === product._id ? 'Selected' : 'Select'}
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        editProduct(product);
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProduct(product._id);
                      }}
                      className="flex-1 bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}