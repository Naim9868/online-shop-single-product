// utils/heroDataUtils.js
export const getSmartHeroData = (globalHero, productHero) => {
  // If no product heroData, return global
  if (!productHero) return globalHero;
  
  // If productHero exists but has empty strings, check if it's actually useful
  const productHeroHasData = Object.values(productHero).some(
    value => value && value.toString().trim() !== ''
  );
  
  // If productHero is basically empty, use global
  if (!productHeroHasData) return globalHero;
  
  // Create merged result
  const result = { ...globalHero };
  
  // Only overwrite with product data if it has actual content
  if (productHero.mainTitle?.trim()) {
    result.mainTitle = productHero.mainTitle;
  }
  
  if (productHero.originalPrice?.trim()) {
    result.originalPrice = productHero.originalPrice;
  }
  
  if (productHero.currentPrice?.trim()) {
    result.currentPrice = productHero.currentPrice;
  }
  
  if (productHero.buttonText?.trim()) {
    result.buttonText = productHero.buttonText;
  }
  
  // Keep product's _id if it exists (for debugging)
  if (productHero._id) {
    result._id = productHero._id;
  }
  
  return result;
};