//api/orders/[id]/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// GET - Get single order
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching order', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);
    // console.log(id);
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { message: 'Error deleting order', error: error.message },
      { status: 500 }
    );
  }
}