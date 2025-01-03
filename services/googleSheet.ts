import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

interface TicketData {
  ticketId: string;
  qrCode: string;
  ticketType: string;
  rowIndex: number;
}

export async function getEventData() {
  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Datos'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Datos"');
    }

    await sheet.loadCells('C3:C4');
    const eventName = sheet.getCell(2, 2).value?.toString() || ''; // C3
    const organizerEmail = sheet.getCell(3, 2).value?.toString() || ''; // C4

    return { eventName, organizerEmail };
  } catch (error) {
    console.error('Error getting event data:', error);
    throw error;
  }
}

export async function getTicketsByEmail(email: string): Promise<TicketData[]> {
  try {
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
    const tickets: TicketData[] = [];

    rows.forEach((row, index) => {
      if (row.get('Email') === email && !row.get('Enviado')) {
        tickets.push({
          ticketId: row.get('ID'),          // Columna B
          ticketType: row.get('Ticket'),    // Columna H
          qrCode: row.get('QR'),            // Columna Y
          rowIndex: index + 2               // +2 porque las filas empiezan en 1 y hay encabezado
        });
      }
    });

    return tickets;
  } catch (error) {
    console.error('Error getting tickets:', error);
    throw error;
  }
}

export async function markTicketsAsSent(rowIndexes: number[]) {
  try {
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

    await sheet.loadCells({
      startRowIndex: Math.min(...rowIndexes) - 1,
      endRowIndex: Math.max(...rowIndexes),
      startColumnIndex: 8,  // Columna I (0-based)
      endColumnIndex: 9,    // Columna I
    });

    for (const rowIndex of rowIndexes) {
      const cell = sheet.getCell(rowIndex - 1, 8); // Columna I (0-based)
      cell.value = '✓';
    }

    await sheet.saveUpdatedCells();
  } catch (error) {
    console.error('Error marking tickets as sent:', error);
    throw error;
  }
} 