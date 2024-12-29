import { NextResponse } from 'next/server';
import { saveSellerToken } from '@/lib/google-sheets-registros';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      throw new Error('No token provided');
    }

    await saveSellerToken(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    return NextResponse.json(
      { error: 'Error saving token' },
      { status: 500 }
    );
  }
} 