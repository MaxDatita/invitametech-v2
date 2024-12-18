import { NextResponse } from 'next/server';
import { MercadoPagoConfig, OAuth } from 'mercadopago';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      throw new Error('No authorization code provided');
    }

    // Obtener credenciales del vendedor
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
    });
    
    const oauth = new OAuth(client);
    const credentials = await oauth.create({
      body: {
        code,
        client_id: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
        client_secret: process.env.NEXT_PUBLIC_MP_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/connect`
      }
    });

    // Guardar el token en .env.local
    console.log('Add this to your .env.local file:');
    console.log(`SELLER_ACCESS_TOKEN=${credentials.access_token}`);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/mercadopagoauth/success`);
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/mercadopagoauth/error`);
  }
} 