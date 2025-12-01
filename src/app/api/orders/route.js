// app/api/orders/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { pusherServer } from '@/lib/pusher';
import { verifyToken } from '@/middleware/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 50, 100);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    
    const allowedSortFields = ['createdAt', 'name', 'totalCost', 'status'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    let query = {};
    if (status && status !== 'all') {
      const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (allowedStatuses.includes(status)) {
        query.status = status;
      }
    }

    const orders = await Order.find(query)
      .sort({ [safeSortBy]: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const total = await Order.countDocuments(query);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching orders'
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const orderData = await request.json();
    
    const required = ['name', 'phone_1', 'district', 'address', 'size', 'shipping'];
    const missingFields = required.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    const sanitizedData = {
      name: orderData.name.toString().trim().substring(0, 100),
      phone_1: orderData.phone_1.toString().trim().substring(0, 20),
      phone_2: orderData.phone_2 ? orderData.phone_2.toString().trim().substring(0, 20) : undefined,
      email: orderData.email ? orderData.email.toString().trim().substring(0, 100) : undefined,
      district: orderData.district.toString().trim().substring(0, 50),
      address: orderData.address.toString().trim().substring(0, 200),
      size: orderData.size.toString().trim().substring(0, 20),
      shipping: orderData.shipping.toString().trim().substring(0, 20),
      productCount: Math.max(1, Math.min(parseInt(orderData.productCount) || 1, 100)),
      subtotal: Math.max(0, parseFloat(orderData.subtotal) || 0),
      shippingCost: Math.max(0, parseFloat(orderData.shippingCost) || 0),
      totalCost: Math.max(0, parseFloat(orderData.totalCost) || 0),
      status: 'pending'
    };

    const order = new Order(sanitizedData);
    await order.save();

    try {
      await pusherServer.trigger('admin-dashboard', 'new-order', {
        order: order.toObject(),
        timestamp: new Date().toISOString()
      });
    } catch (pusherError) {
      console.error('Pusher notification failed:', pusherError);
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Order created successfully', 
        order 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error creating order'
      },
      { status: 500 }
    );
  }
}

// PUT - Update order status
async function putHandler(request) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    
    const { id, _id, ...otherUpdates } = updateData;
    
    // Use _id for MongoDB (primary key)
    const orderId = _id || id;
    
    if (!orderId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Order ID is required' 
        },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated for security
    const allowedUpdates = ['status', 'notes', 'trackingNumber'];
    const filteredUpdates = {};
    
    Object.keys(otherUpdates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = otherUpdates[key];
      }
    });

    // Add updatedAt timestamp
    filteredUpdates.updatedAt = new Date();

    const order = await Order.findByIdAndUpdate(
      orderId,
      filteredUpdates,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!order) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Order not found' 
        },
        { status: 404 }
      );
    }

    // Notify about order update
    try {
      await pusherServer.trigger('admin-dashboard', 'order-updated', {
        order: order.toObject(),
        message: `Order ${order.orderNumber} status updated to ${order.status}`,
        timestamp: new Date().toISOString()
      });
    } catch (pusherError) {
      console.error('Pusher notification failed:', pusherError);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors
        },
        { status: 400 }
      );
    }

    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid order ID format'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        message: 'Error updating order'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Order ID is required' 
        },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Order not found' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error deleting order'
      },
      { status: 500 }
    );
  }
}

// Apply authentication middleware
// export const GET = verifyToken(getHandler);
export const PUT = verifyToken(putHandler);