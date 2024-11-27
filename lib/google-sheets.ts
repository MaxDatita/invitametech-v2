import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

interface Message {
  id: number;
  nombre: string;
  mensaje: string;
}

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  total: number;
}

interface Invitado {
  fecha: string;
  nombre: string;
  acompanantes: number;
  nota?: string;
}

export async function getMessages(
  page: number = 1, 
  pageSize: number = 20, 
  random: boolean = false
): Promise<MessagesResponse> {
  try {
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

    const allRows = await sheet.getRows();
    const total = allRows.length;

    let rowsToProcess = [...allRows];
    if (random) {
      // Mezclar aleatoriamente si se solicita
      rowsToProcess = rowsToProcess.sort(() => Math.random() - 0.5);
    } else {
      // Ordenar por fecha descendente si no es aleatorio
      rowsToProcess = rowsToProcess.reverse();
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRows = rowsToProcess.slice(start, end);

    const messages = paginatedRows
      .map((row, index) => ({
        id: start + index,
        nombre: row.get('Nombre'),
        mensaje: row.get('Mensaje')
      }))
      .filter(msg => msg.nombre && msg.mensaje);

    return {
      messages,
      hasMore: end < total,
      total
    };
  } catch (error) {
    console.error('Error en getMessages:', error);
    return { messages: [], hasMore: false, total: 0 };
  }
}

export async function guardarAsistencia(invitado: Invitado): Promise<boolean> {
  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Invitados'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Invitados"');
    }

    const cantidadTotal = invitado.acompanantes === 0 ? 1 : invitado.acompanantes + 1;

    await sheet.addRow({
      'Fecha': invitado.fecha,
      'Invitado': invitado.nombre,
      'Cantidad': cantidadTotal,
      'Nota': invitado.nota || ''
    });

    return true;
  } catch (error) {
    console.error('Error en guardarAsistencia:', error);
    return false;
  }
} 