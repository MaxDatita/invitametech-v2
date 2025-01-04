import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

interface TicketData {
  ticketId: string;
  qrCode: string;
  ticketType: string;
  rowIndex: number;
}

// Crear una única instancia de JWT
const getJWTClient = () => {
  const key = process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n');
  console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  console.log('GOOGLE_PRIVATE_KEY:', key ? 'Key is set' : 'Key is missing');
  
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

// Obtener una instancia del documento
const getSpreadsheet = async () => {
  const jwt = getJWTClient();
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
  await doc.loadInfo();
  return doc;
};

export async function getEventData() {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Datos'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Datos"');
    }

    await sheet.loadCells('C3:C4');
    const eventName = sheet.getCell(2, 2).value?.toString() || '';
    const organizerEmail = sheet.getCell(3, 2).value?.toString() || '';

    return { eventName, organizerEmail };
  } catch (error) {
    console.error('Error getting event data:', error);
    throw error;
  }
}

export async function getTicketsByEmail(email: string): Promise<TicketData[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Invitados'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Invitados"');
    }

    const rows = await sheet.getRows();
    const tickets: TicketData[] = [];

    rows.forEach((row, index) => {
      const enviado = row.get('Enviado');
      if (row.get('Email') === email && !enviado) {
        tickets.push({
          ticketId: row.get('ID'),
          ticketType: row.get('Ticket'),
          qrCode: row.get('QR').replace('@', ''),
          rowIndex: index + 2
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
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Invitados'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Invitados"');
    }

    await sheet.loadCells({
      startRowIndex: Math.min(...rowIndexes) - 1,
      endRowIndex: Math.max(...rowIndexes),
      startColumnIndex: 8,
      endColumnIndex: 9,
    });

    for (const rowIndex of rowIndexes) {
      const cell = sheet.getCell(rowIndex - 1, 8);
      cell.value = '✓';
    }

    await sheet.saveUpdatedCells();
  } catch (error) {
    console.error('Error marking tickets as sent:', error);
    throw error;
  }
} 