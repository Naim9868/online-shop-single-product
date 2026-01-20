import mongoose from 'mongoose';

const selectedProductSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  selectedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Only one selected product at a time
selectedProductSchema.statics.setSelectedProduct = async function(productId) {
  await this.deleteMany({});
  return await this.create({ productId });
};

// 🔥 FIXED: Remove populate, fetch product separately
selectedProductSchema.statics.getSelectedProduct = async function() {
  try {
    const selected = await this.findOne();
    
    if (!selected) {
      return null;
    }
    
    // Just return the ID - client will fetch details separately
    return { _id: selected.productId };
    
  } catch (error) {
    console.error('Error in getSelectedProduct:', error);
    return null;
  }
};

export default mongoose.models.SelectedProduct || 
       mongoose.model('SelectedProduct', selectedProductSchema);