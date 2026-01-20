import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import {SelectedProduct} from '@/models';

// GET - Get the currently selected product
export async function GET() {
  try {
    await connectDB();
    
    const selectedProduct = await SelectedProduct.getSelectedProduct();
    
    if (!selectedProduct) {
      return NextResponse.json({ 
        selectedProduct: null,
        message: 'No product selected'
      });
    }

    return NextResponse.json({ 
      selectedProduct,
      message: 'Product found'
    });
  } catch (error) {
    console.error('Error fetching selected product:', error);
    return NextResponse.json(
      { message: 'Error fetching selected product', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Set the selected product
export async function POST(request) {
  try {
    await connectDB();
    const { productId } = await request.json();
    // console.log(productId);

    if (!productId) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const selectedProduct = await SelectedProduct.setSelectedProduct(productId);
    
    return NextResponse.json({ 
      message: 'Product selected successfully',
      selectedProduct: selectedProduct.productId
    });
  } catch (error) {
    console.error('Error selecting product:', error);
    return NextResponse.json(
      { message: 'Error selecting product', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Clear the selected product
export async function DELETE() {
  try {
    await connectDB();
    await SelectedProduct.deleteMany({});
    return NextResponse.json({ message: 'Product selection cleared' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error clearing selection', error: error.message },
      { status: 500 }
    );
  }
}