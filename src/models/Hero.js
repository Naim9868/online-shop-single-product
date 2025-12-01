import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  mainTitle: { 
    type: String, 
    default: '৩ পিস ইউনিক ফুল স্লিভ প্রিন্টেড শোল্ডার টি-শার্ট মাত্র ৯৯০ টাকা' 
  },
  originalPrice: { type: String, default: '2000' },
  currentPrice: { type: String, default: '990' },
  buttonText: { type: String, default: 'আগের মূল্য (৩ পিস)' }
}, {
  timestamps: true
});

// Only one hero document should exist
heroSchema.statics.getHeroData = async function() {
  let hero = await this.findOne();
  if (!hero) {
    hero = await this.create({});
  }
  return hero;
};

export default mongoose.models.Hero || mongoose.model('Hero', heroSchema);