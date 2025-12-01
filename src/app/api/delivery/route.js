import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeliveryCharge from '@/models/DeliveryCharge';

// GET - Get delivery charge data
export async function GET() {
  try {
    await connectDB();
    const deliveryCharge = await DeliveryCharge.getDeliveryCharge();
    return NextResponse.json(deliveryCharge);
  } catch (error) {
    console.error('Error fetching delivery charge:', error);
    return NextResponse.json(
      { message: 'Error fetching delivery charge', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Update delivery charge data
export async function POST(request) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    
    let deliveryCharge = await DeliveryCharge.findOne();
    
    if (deliveryCharge) {
      deliveryCharge = await DeliveryCharge.findByIdAndUpdate(
        deliveryCharge._id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      deliveryCharge = new DeliveryCharge(updateData);
      await deliveryCharge.save();
    }

    return NextResponse.json({
      message: 'Delivery charge updated successfully',
      deliveryCharge
    });
  } catch (error) {
    console.error('Error updating delivery charge:', error);
    return NextResponse.json(
      { message: 'Error updating delivery charge', error: error.message },
      { status: 500 }
    );
  }
}