import mongoose from 'mongoose';

const sizeChartSchema = new mongoose.Schema({
  size: { type: String, required: true },
  chest: { type: String, required: true },
  length: { type: String, required: true }
});

const productDetailsSchema = new mongoose.Schema({
  product_collection: { type: String, default: 'Summer Collection' },
  fabric: { type: String, default: 'Imported Chine Mash' },
  style: { type: String, default: 'Casual' },
  gender: { type: String, default: 'Men' }
});

const heroDataSchema = new mongoose.Schema({
  mainTitle: String,
  originalPrice: String,
  currentPrice: String,
  buttonText: String
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  
  // Hero section override
  heroData: heroDataSchema,
  
  // Product features
  features: [String],
  
  // Available sizes
  sizes: { type: [String], default: ['M', 'L', 'XL', '2XL'] },
  
  // Images
  images: [String],
  mainImage: String,
  
  // Size chart
  sizeChart: [sizeChartSchema],
  
  // Product details 
  productDetails: productDetailsSchema,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);