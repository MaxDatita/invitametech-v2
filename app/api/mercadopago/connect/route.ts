import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code provided');
    }

    // Aquí procesarías el código de autorización
    // y guardarías el token de acceso del vendedor

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/mercadopagoauth/success`);
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/mercadopagoauth/error`);
  }
} 