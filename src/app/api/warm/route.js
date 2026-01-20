import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint warms up the serverless function
  return NextResponse.json({ 
    status: 'warm', 
    timestamp: new Date().toISOString() 
  });
}