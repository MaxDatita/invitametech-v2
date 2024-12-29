import { NextResponse } from 'next/server';
import { MercadoPagoConfig, OAuth } from 'mercadopago';

export async function GET() {
  try {
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
    });
    const oauth = new OAuth(client);

    const url = oauth.getAuthorizationURL({
      options: {
        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
        redirect_uri: 'https://auth.eventechy.com/api/mercadopago/connect',
        state: process.env.NEXT_PUBLIC_BASE_URL // Identificador del proyecto
      },
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Error getting authorization URL' },
      { status: 500 }
    );
  }
} 