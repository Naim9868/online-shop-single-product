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
  // Remove any existing selected product
  await this.deleteMany({});
  // Create new selected product
  return await this.create({ productId });
};

selectedProductSchema.statics.getSelectedProduct = async function() {
  const selected = await this.findOne().populate('productId');
  return selected ? selected.productId : null;
};

export default mongoose.models.SelectedProduct || mongoose.model('SelectedProduct', selectedProductSchema);