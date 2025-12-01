import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Hero from '@/models/Hero';

// GET - Get hero data
export async function GET() {
  try {
    await connectDB();
    const hero = await Hero.getHeroData();
    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return NextResponse.json(
      { message: 'Error fetching hero data', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Update hero data
export async function POST(request) {
  try {
    await connectDB();
    
    const updateData = await request.json();
    
    let hero = await Hero.findOne();
    
    if (hero) {
      hero = await Hero.findByIdAndUpdate(
        hero._id,
        updateData,
        { new: true, runValidators: true }
      );
    } else {
      hero = new Hero(updateData);
      await hero.save();
    }

    return NextResponse.json({
      message: 'Hero data updated successfully',
      hero
    });
  } catch (error) {
    console.error('Error updating hero data:', error);
    return NextResponse.json(
      { message: 'Error updating hero data', error: error.message },
      { status: 500 }
    );
  }
}