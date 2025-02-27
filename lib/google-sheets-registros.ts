import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { theme } from '../config/theme';

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

type TicketAvailabilityResponse = {
  available: boolean;
  remainingTickets: number;
  error?: string;
}

export async function getMessages(
  page: number = 1, 
  pageSize: number = 20, 
  random: boolean = false
): Promise<MessagesResponse> {
  

    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
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
  }

// Función para generar ID único de 5 dígitos
async function generateUniqueId(sheet: GoogleSpreadsheetWorksheet): Promise<string> {
  try {
    // Obtener todos los IDs existentes
    const rows = await sheet.getRows();
    const existingIds = rows.map(row => row.get('ID')).filter(Boolean);
    
    // Generar nuevo ID hasta que sea único
    let newId;
    do {
      // Generar número aleatorio de 5 dígitos (10000 a 99999)
      newId = Math.floor(10000 + Math.random() * 90000).toString();
    } while (existingIds.includes(newId));
    
    return newId;
  } catch (error) {
    console.error('Error generando ID único:', error);
    throw error;
  }
}

// Función para generar fórmula de QR para una fila específica
function generateQRFormula(rowNumber: number): string {
  return `=HYPERLINK("https://quickchart.io/qr?text=ID:" & ENCODEURL(B${rowNumber}:B${rowNumber}) & ",Nombre:" & ENCODEURL(C${rowNumber}:C${rowNumber}) & "&size=150")`;
}

export async function registrarTickets(nombre: string, email: string, tipoTicket: string, cantidad: number) {
  try {
    // Remover la verificación de disponibilidad aquí ya que se hace en el frontend
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

    // Obtener el número total de filas actual
    const rows = await sheet.getRows();
    const startingRowNumber = rows.length + 2;

    // Formatear la fecha actual en zona horaria Argentina
    const now = new Date();
    const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    // Crear array de nuevas filas
    const newRows = [];
    for (let i = 0; i < cantidad; i++) {
      const rowNumber = startingRowNumber + i;
      const uniqueId = await generateUniqueId(sheet);
      const qrFormula = generateQRFormula(rowNumber);

      newRows.push({
        'Fecha': fechaFormateada,
        'ID': uniqueId,
        'Invitado': nombre.trim(),
        'Email': email.toLowerCase().trim(),
        'Ticket': tipoTicket.split('(')[0].trim(),
        'QRimg': qrFormula
      });
    }

    // Agregar todas las filas de una vez
    await sheet.addRows(newRows);
    return true;
  } catch (error) {
    console.error('Error registrando tickets:', {
      error,
      datos: { nombre, email, tipoTicket, cantidad }
    });
    throw error;
  }
} 

// Funciones para manejar el token del vendedor
export async function saveSellerToken(token: string): Promise<void> {
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

    await sheet.loadCells('C2');
    const tokenCell = sheet.getCell(1, 2); // C2 en coordenadas 0-based
    tokenCell.value = token;
    await sheet.saveUpdatedCells();
    
  } catch (error) {
    console.error('Error saving seller token:', error);
    throw error;
  }
}

// Usar token del vendedor para la venta de tickets
export async function getSellerToken(): Promise<string | null> {
  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Datos'];
    if (!sheet) return null;

    await sheet.loadCells('C2');
    const tokenCell = sheet.getCell(1, 2); // C2 en coordenadas 0-based
    return tokenCell.value?.toString() || null;
  } catch (error) {
    console.error('Error getting seller token:', error);
    return null;
  }
} 

export async function getScannerPin(): Promise<string | null> {
  try {
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Datos'];
    if (!sheet) return null;

    await sheet.loadCells('C6');
    const pinCell = sheet.getCell(5, 2); // C6 en coordenadas 0-based
    return pinCell.value?.toString() || null;
  } catch (error) {
    console.error('Error obteniendo PIN del scanner:', error);
    return null;
  }
} 

export const checkTicketAvailability = async (
  ticketType: string,
  requestedQuantity: number
): Promise<TicketAvailabilityResponse> => {
  try {
    const response = await fetch(
      `/api/check-tickets?type=${ticketType}&quantity=${requestedQuantity}`
    );

    if (!response.ok) {
      throw new Error('Error al verificar disponibilidad');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    return {
      available: false,
      remainingTickets: 0,
      error: 'Error al verificar disponibilidad'
    };
  }
}; 

