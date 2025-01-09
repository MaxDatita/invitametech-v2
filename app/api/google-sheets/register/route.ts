import { NextResponse } from 'next/server';
import { registrarTickets } from '@/lib/google-sheets-registros';

export async function POST(request: Request) {
  try {
    const { nombre, email, tipoTicket, cantidad } = await request.json();

    await registrarTickets(nombre, email, tipoTicket, Number(cantidad));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registrando tickets:', error);
    return NextResponse.json(
      { error: 'Error registrando tickets', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 