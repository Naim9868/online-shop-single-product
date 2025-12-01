import mongoose from 'mongoose';

const deliveryChargeSchema = new mongoose.Schema({
  insideCity: { type: String, default: 'inside dhaka' },
  outsideCity: { type: String, default: 'outside dhaka' },
  insideCost: { type: String, default: '60' },
  outsideCost: { type: String, default: '120' }
}, {
  timestamps: true
});

// Only one delivery charge document should exist
deliveryChargeSchema.statics.getDeliveryCharge = async function() {
  let deliveryCharge = await this.findOne();
  if (!deliveryCharge) {
    deliveryCharge = await this.create({});
  }
  return deliveryCharge;
};

export default mongoose.models.DeliveryCharge || mongoose.model('DeliveryCharge', deliveryChargeSchema);