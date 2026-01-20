// src/models/index.js
import mongoose from 'mongoose';

// Import all models
import Product from './Product';
import SelectedProduct from './SelectedProduct';

// Register models
export { Product, SelectedProduct };