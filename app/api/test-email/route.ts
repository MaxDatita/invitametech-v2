import { NextResponse } from 'next/server';
import { sendTicketEmail } from '@/services/email';

export async function GET() {
  try {
    const response = await sendTicketEmail({
      nombre: "Usuario Prueba",
      email: "maxi.chamas@gmail.com",
      tipoTicket: "Regular",
      quantity: 1
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error en test:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 