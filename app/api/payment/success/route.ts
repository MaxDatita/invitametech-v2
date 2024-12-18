import { NextResponse } from 'next/server';
import { addInvitado } from '@/lib/google-sheets-registros';

export async function POST(request: Request) {
  try {
    // Obtener la URL completa del referer
    const referer = request.headers.get('referer') || '';
    const urlParams = new URLSearchParams(referer.split('?')[1]);
    const body = await request.json();
    
    // Obtener quantity del body y como respaldo de los parámetros URL
    const quantity = body.quantity || parseInt(urlParams.get('quantity') || '1');

    await addInvitado({
      nombre: body.nombre,
      email: body.email,
      tipoTicket: body.tipoTicket,
      quantity: quantity
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in payment success:', error);
    return NextResponse.json(
      { error: 'Error processing payment success' },
      { status: 500 }
    );
  }
} 