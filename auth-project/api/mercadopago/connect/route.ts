import { NextResponse } from 'next/server';
import { MercadoPagoConfig, OAuth } from 'mercadopago';
import { saveSellerToken } from '@/lib/google-sheets-registros';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  try {
    const code = searchParams.get('code');
    const projectUrl = searchParams.get('state');

    if (!code || !projectUrl) {
      throw new Error('Missing required parameters');
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
        redirect_uri: 'https://auth.eventechy.com/api/mercadopago/connect'
      }
    });

    if (!credentials.access_token) {
      throw new Error('No access token received');
    }

    await saveSellerToken(credentials.access_token);

    // Redirigir de vuelta al proyecto original
    return NextResponse.redirect(`https://${projectUrl}/mercadopagoauth/success`);
  } catch (error) {
    return NextResponse.redirect(`https://${searchParams.get('state') || ''}/mercadopagoauth/error`);
  }
} 