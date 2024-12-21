import { NextResponse } from 'next/server';
import { addInvitado } from '@/lib/google-sheets-registros';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.nombre || !body.email || !body.tipoTicket) {
      throw new Error('Missing required fields');
    }

    await addInvitado({
      nombre: body.nombre,
      email: body.email,
      tipoTicket: body.tipoTicket,
      quantity: body.quantity
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in payment success:', error);
    return NextResponse.json(
      { error: 'Error processing payment success', details: error },
      { status: 500 }
    );
  }
} 