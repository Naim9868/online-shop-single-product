// app/api/dashboard/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { verifyToken } from '@/middleware/auth';

async function handler(req, res) {
  try {
    await connectDB();

    const [totalOrders, pendingOrders, productsCount, recentOrders, revenueStats] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalCost' },
            averageOrder: { $avg: '$totalCost' }
          }
        }
      ])
    ]);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const averageOrder = revenueStats[0]?.averageOrder || 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue,
        productsCount,
        averageOrder: Math.round(averageOrder)
      },
      recentOrders
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Error fetching dashboard data' },
      { status: 500 }
    );
  }
}

export const GET = verifyToken(handler);