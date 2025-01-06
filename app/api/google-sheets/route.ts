import { NextResponse } from 'next/server';
import { getEventData, getUnsentTickets, markTicketsAsSent } from '@/services/googleSheet';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const eventData = await getEventData();
    const tickets = await getUnsentTickets(email);
    return NextResponse.json({ eventData, tickets });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { rowIndexes } = await request.json();
    
    console.log('Recibida solicitud para marcar filas:', rowIndexes);

    if (!rowIndexes || !Array.isArray(rowIndexes)) {
      return NextResponse.json(
        { error: 'rowIndexes debe ser un array' },
        { status: 400 }
      );
    }

    await markTicketsAsSent(rowIndexes);
    
    return NextResponse.json({ 
      success: true,
      message: `Marcadas ${rowIndexes.length} filas como enviadas`
    });
  } catch (error) {
    console.error('Error al marcar tickets como enviados:', error);
    return NextResponse.json(
      { error: 'Error al marcar tickets como enviados', details: error.message },
      { status: 500 }
    );
  }
} 