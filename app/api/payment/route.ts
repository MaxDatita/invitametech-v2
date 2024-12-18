import { NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const preference = await createPreference({
      items: [{
        id: body.ticketType,
        title: body.quantity > 1
        ? `Ticket ${body.title} x ${body.quantity}`
        : `Ticket ${body.title}`,
        unit_price: body.unitPrice,
        quantity: body.quantity,
      }],
      payer: {
        name: body.name,
        email: body.email,
      }
    });

    return NextResponse.json({
      preferenceId: preference.id,
      init_point: preference.init_point,
      // Usar sandbox_init_point para pruebas
      // init_point: preference.sandbox_init_point 
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Error creating payment preference' },
      { status: 500 }
    );
  }
} 