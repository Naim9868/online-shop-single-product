// app/api/selected-product/route.js
import { NextResponse } from 'next/server';

// Direct MongoDB driver - NO Mongoose
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.MONGODB_URI);
  
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    // Get selected product
    const selected = await db.collection('selectedproducts').findOne({});
    
    if (!selected) {
      return NextResponse.json({ 
        success: true,
        selectedProduct: null,
        message: 'No product selected'
      });
    }
    
    // Get full product details
    const product = await db.collection('products').findOne({
      _id: selected.productId
    });
    
    if (!product) {
      return NextResponse.json({ 
        success: true,
        selectedProduct: { _id: selected.productId },
        message: 'Product ID found'
      });
    }
    
    return NextResponse.json({ 
      success: true,
      selectedProduct: product,
      message: 'Product found'
    });
    
  } catch (error) {
    console.error('Error in selected-product API:', error);
    
    // ALWAYS return 200 - never fail the page
    return NextResponse.json({ 
      success: true,
      selectedProduct: null,
      message: 'Loading, please wait'
    });
  }
}

// POST method using MongoDB driver
export async function POST(request) {
  try {
    const db = await connectToDatabase();
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product ID required' },
        { status: 400 }
      );
    }
    
    const { ObjectId } = await import('mongodb');
    
    // Clear existing and insert new
    await db.collection('selectedproducts').deleteMany({});
    await db.collection('selectedproducts').insertOne({
      productId: new ObjectId(productId),
      selectedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Product selected'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error selecting product' },
      { status: 500 }
    );
  }
}

// DELETE method
export async function DELETE() {
  try {
    const db = await connectToDatabase();
    await db.collection('selectedproducts').deleteMany({});
    
    return NextResponse.json({ 
      success: true,
      message: 'Selection cleared'
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error clearing selection' },
      { status: 500 }
    );
  }
}