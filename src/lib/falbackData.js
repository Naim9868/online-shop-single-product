// lib/fallbackData.js
export const fallbackProduct = {
  _id: 'fallback-product-123',
  name: "Premium Cotton T-Shirt",
  price: 990,
  description: "High-quality 100% cotton t-shirt with premium finish. Perfect for casual wear. Soft, breathable fabric that feels great on your skin.",
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w-800&auto=format&fit=crop"
  ],
  mainImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'White', 'Gray', 'Navy Blue'],
  features: [
    "100% Premium Cotton",
    "Breathable & Comfortable",
    "Machine Washable",
    "Premium Double Stitching",
    "No Fade Colors",
    "Soft Touch Fabric"
  ],
  sizeChart: [
    { size: 'S', chest: '36"', length: '27"' },
    { size: 'M', chest: '38"', length: '28"' },
    { size: 'L', chest: '40"', length: '29"' },
    { size: 'XL', chest: '42"', length: '30"' },
    { size: 'XXL', chest: '44"', length: '31"' }
  ],
  productDetails: {
    product_collection: "Summer Collection 2024",
    fabric: "100% Premium Cotton",
    style: "Casual, Regular Fit",
    gender: "Unisex (Men & Women)"
  },
  heroData: {
    mainTitle: "Limited Time Offer - Premium T-Shirt!",
    originalPrice: "2000",
    currentPrice: "990",
    buttonText: "Buy Now & Save 50%"
  },
  stock: 100
};

export const fallbackHero = {
  mainTitle: "Premium T-Shirt Collection",
  originalPrice: "2000",
  currentPrice: "990",
  buttonText: "Special Offer"
};

// Default delivery charge
export const fallbackDelivery = {
  insideDhaka: 60,
  outsideDhaka: 120,
  freeShippingThreshold: 2000
};