import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
<<<<<<< HEAD
=======
import bcrypt from 'bcryptjs';
>>>>>>> d1c856b (final commit)

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
=======
    // console.log("jwt secret:", JWT_SECRET);
    // console.log("jwt expires in:", JWT_EXPIRES_IN);

    // console.log('🔍 Attempting login for:', email);

>>>>>>> d1c856b (final commit)
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

<<<<<<< HEAD
    // Check password
    const isPasswordValid = await user.comparePassword(password);
=======
//     console.log('Entered password:', password);
// console.log('Stored hash:', user.password);
//  console.log("user authenticated:", user);
    // Check password
    // const isPasswordValid = await user.comparePassword(password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
// console.log('Password comparison result:', isPasswordValid);
   
>>>>>>> d1c856b (final commit)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check email verification
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

<<<<<<< HEAD
=======
   

>>>>>>> d1c856b (final commit)
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

<<<<<<< HEAD
=======
    // console.log("token generated:", token); 


>>>>>>> d1c856b (final commit)
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}