import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { theme } from '@/config/theme';

// Endopoint para verificar disponibilidad de tickets en caso de que la venta por lotes esté habilitada

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketType = searchParams.get('type');
    const quantity = Number(searchParams.get('quantity') || 1);

    if (!ticketType) {
      return NextResponse.json({ error: 'Tipo de ticket requerido' }, { status: 400 });
    }

    // Si los lotes no están habilitados o el máximo es 0, siempre hay disponibilidad
    if (!theme.tickets.lotes.enabled || theme.tickets.lotes.maxTicketsPerLot === 0) {
      return NextResponse.json({ available: true, remainingTickets: -1 });
    }

    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Invitados'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Invitados"');
    }

    const rows = await sheet.getRows();
    // Contar todos los tickets, incluyendo el encabezado
    const soldTickets = rows.length;
    
    console.log('Verificación de disponibilidad:', {
      totalFilas: rows.length,
      ticketsVendidos: soldTickets,
      limiteTotal: theme.tickets.lotes.maxTicketsPerLot,
      disponibles: theme.tickets.lotes.maxTicketsPerLot - soldTickets
    });

    // Si ya alcanzamos o superamos el límite del lote
    if (soldTickets >= theme.tickets.lotes.maxTicketsPerLot) {
      return NextResponse.json({
        available: false,
        remainingTickets: 0
      });
    }

    // Si hay un límite específico para este tipo de ticket
    const ticketConfig = theme.tickets.types.find(t => t.id === ticketType);
    if (ticketConfig?.maxPerLot && ticketConfig.maxPerLot > 0) {
      const soldOfThisType = rows.filter(row => 
        row.get('Ticket')?.trim() === ticketConfig.name
      ).length;

      const remaining = ticketConfig.maxPerLot - soldOfThisType;
      return NextResponse.json({
        available: remaining >= quantity,
        remainingTickets: remaining
      });
    }

    // Si no hay límite específico, usar el límite general del lote
    const remaining = theme.tickets.lotes.maxTicketsPerLot - soldTickets;
    return NextResponse.json({
      available: remaining >= quantity,
      remainingTickets: remaining
    });

  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    return NextResponse.json(
      { error: 'Error al verificar disponibilidad' },
      { status: 500 }
    );
  }
} 