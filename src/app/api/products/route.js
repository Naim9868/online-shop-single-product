import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

// GET - Get all products
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments();
    
    return NextResponse.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error fetching products', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    await connectDB();
    
    const productData = await request.json();
    // console.log(productData);
    // Validate required fields
    if (!productData.name || !productData.price || !productData.description) {
      return NextResponse.json(
        { message: 'Name, price, and description are required' },
        { status: 400 }
      );
    }

    const product = new Product(productData);
    await product.save();

    return NextResponse.json(
      { message: 'Product created successfully', product },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Error creating product', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request) {
  try {
    await connectDB();
    const requestBody = await request.json();
    // console.log('PUT Request Body:', JSON.stringify(requestBody, null, 2));
    const { id, ...updateData } = requestBody;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Error updating product', error: error.message },
      { status: 500 }
    );
  }
}