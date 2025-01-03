import { google } from 'googleapis';

interface TicketData {
  ticketId: string;
  qrCode: string;
  ticketType: string;
  rowIndex: number;
}

export async function getEventData() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Obtener datos del evento
    const eventDataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Datos!C3:C4',
    });

    const eventName = eventDataResponse.data.values?.[0]?.[0] || '';
    const organizerEmail = eventDataResponse.data.values?.[1]?.[0] || '';

    return { eventName, organizerEmail };
  } catch (error) {
    console.error('Error getting event data:', error);
    throw error;
  }
}

export async function getTicketsByEmail(email: string): Promise<TicketData[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Obtener todos los tickets del email
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Invitados!B:Y',
    });

    const tickets: TicketData[] = [];
    
    response.data.values?.forEach((row, index) => {
      // Solo incluir tickets que coincidan con el email y no tengan el check de enviado
      if (row[2] === email && !row[8]) { // row[8] es la columna I (check de enviado)
        tickets.push({
          ticketId: row[1],     // Columna B
          ticketType: row[7],   // Columna H
          qrCode: row[24],      // Columna Y
          rowIndex: index + 1   // Guardamos el índice de la fila para actualizar después
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
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Preparar los datos para actualizar
    const requests = rowIndexes.map(rowIndex => ({
      range: `Invitados!I${rowIndex}`,
      values: [['✓']] // Agregar el check
    }));

    // Actualizar todas las filas de una vez
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: requests
      }
    });

  } catch (error) {
    console.error('Error marking tickets as sent:', error);
    throw error;
  }
} 