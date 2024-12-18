import { NextResponse } from 'next/server';
import { MercadoPagoConfig, OAuth } from 'mercadopago';
import { saveSellerToken } from '@/lib/google-sheets-registros';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code provided');
    }

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
    });
    
    const oauth = new OAuth(client);
    const credentials = await oauth.create({
      body: {
        client_secret: process.env.NEXT_PUBLIC_MP_CLIENT_SECRET!,
        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/connect`
      }
    });

    if (!credentials.access_token) {
      throw new Error('No access token received');
    }

    await saveSellerToken(credentials.access_token);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/mercadopagoauth/success`);
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/mercadopagoauth/error`);
  }
} 