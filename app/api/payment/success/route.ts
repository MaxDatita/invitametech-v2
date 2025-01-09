import { NextResponse } from 'next/server';
import { registrarTickets } from '@/lib/google-sheets-registros';

export async function POST(request: Request) {
  try {
    const { nombre, email, tipoTicket, quantity } = await request.json();

    await registrarTickets(
      nombre,
      email,
      tipoTicket,
      Number(quantity)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en el proceso de pago:', error);
    return NextResponse.json(
      { error: 'Error en el proceso de pago', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 