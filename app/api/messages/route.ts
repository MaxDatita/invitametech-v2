import { getMessages } from '@/lib/google-sheets';
import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const random = searchParams.get('random') === 'true';

  try {
    const result = await getMessages(page, pageSize, random);
    
    return NextResponse.json({
      messages: result.messages,
      hasMore: result.hasMore,
      page: page
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener los mensajes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fecha, nombre, mensaje } = body;
    
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Mensajes'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Mensajes"');
    }
    
    await sheet.addRow({
      Fecha: fecha,
      Nombre: nombre,
      Mensaje: mensaje
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/messages:', error);
    return NextResponse.json(
      { error: 'Error al guardar el mensaje' }, 
      { status: 500 }
    );
  }
} 