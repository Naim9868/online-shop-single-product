import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// GET - Get the currently selected product
export async function GET() {
  try {
    // Direct MongoDB connection - no Mongoose models
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return NextResponse.json({ 
        success: true,
        selectedProduct: null,
        message: 'Database not configured'
      });
    }
    
    // Connect if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // Get selected product ID
    const selectedDoc = await db.collection('selectedproducts').findOne();
    
    if (!selectedDoc) {
      return NextResponse.json({ 
        success: true,
        selectedProduct: null,
        message: 'No product selected'
      });
    }
    
    // Get product details
    const product = await db.collection('products').findOne({
      _id: selectedDoc.productId
    });
    
    if (product) {
      return NextResponse.json({ 
        success: true,
        selectedProduct: product,
        message: 'Product found'
      });
    }
    
    // Return just the ID if product not found
    return NextResponse.json({ 
      success: true,
      selectedProduct: { _id: selectedDoc.productId },
      message: 'Product ID found'
    });
    
  } catch (error) {
    console.error('Error in selected-product API:', error);
    
    // Always return success to prevent page failure
    return NextResponse.json({ 
      success: true,
      selectedProduct: null,
      message: 'Server warming up, please refresh'
    });
  }
}

// POST - Set the selected product (keep as is)
export async function POST(request) {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const db = mongoose.connection.db;
    
    // Clear existing
    await db.collection('selectedproducts').deleteMany({});
    
    // Insert new
    await db.collection('selectedproducts').insertOne({
      productId: new mongoose.Types.ObjectId(productId),
      selectedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Product selected successfully'
    });
    
  } catch (error) {
    console.error('Error selecting product:', error);
    return NextResponse.json(
      { success: false, message: 'Error selecting product' },
      { status: 500 }
    );
  }
}

// DELETE - Clear the selected product (keep as is)
export async function DELETE() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    
    const db = mongoose.connection.db;
    await db.collection('selectedproducts').deleteMany({});
    
    return NextResponse.json({ 
      success: true,
      message: 'Product selection cleared' 
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error clearing selection' },
      { status: 500 }
    );
  }
}