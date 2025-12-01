import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Customer information
  name: { type: String, required: true },
  phone_1: { type: String, required: true },
  phone_2: String,
  email: String,
  district: { type: String, required: true },
  address: { type: String, required: true },
  
  // Order details
  size: { type: String, required: true },
  productCount: { type: Number, default: 1 },
  shipping: { 
    type: String,
    required: true 
  },
  
  // Financial details
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  
  // Order status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for better query performance
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ phone_1: 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);