import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
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


// Registro de invitados con fecha, nombre, email y tipo de ticket
export async function addInvitado(data: {
  nombre: string;
  email: string;
  tipoTicket: string;
  quantity?: number;
}) {
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

    const quantity = parseInt(String(data.quantity) || '1', 10);

    for (let i = 0; i < quantity; i++) {
      const now = new Date();
      const argentinaTime = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);

      const rowData = {
        'Fecha': argentinaTime,
        'Invitado': data.nombre,
        'Email': data.email,
        'Ticket': data.tipoTicket.split('(')[0].trim(),
      };

      try {
        await sheet.addRow(rowData);
      } catch (rowError) {
        console.error('Error adding row:', rowError);
        throw rowError;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in addInvitado:', error);
    throw error;
  }
} 

// Guardar y obtener el token del vendedor
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
    
    console.log('Token saved to cell C2');
  } catch (error) {
    console.error('Error saving seller token:', error);
    throw error;
  }
}

// Usar toquen del vendedor para la venta de tickets
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
    console.log('Iniciando registro de tickets:', { nombre, email, tipoTicket, cantidad });

    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: SCOPES,
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
    
    console.log(`Número inicial de filas: ${rows.length}, comenzando en fila ${startingRowNumber}`);

    // Crear array de nuevas filas
    const newRows = [];
    for (let i = 0; i < cantidad; i++) {
      const rowNumber = startingRowNumber + i;
      const uniqueId = await generateUniqueId(sheet);
      
      const qrFormula = generateQRFormula(rowNumber);
      console.log(`Preparando fila ${rowNumber}:`, {
        uniqueId,
        qrFormula
      });

      newRows.push({
        'Fecha': new Date().toLocaleDateString(),
        'ID': uniqueId,
        'Nombre': nombre,
        'Email': email,
        'Ticket': tipoTicket,
        'QRimg': qrFormula
      });
    }

    console.log('Filas a agregar:', newRows);

    // Agregar todas las filas de una vez
    await sheet.addRows(newRows);
    
    console.log(`✅ Registrados ${cantidad} tickets para ${email}`);
    return true;
  } catch (error) {
    console.error('Error registrando tickets:', {
      error,
      datos: { nombre, email, tipoTicket, cantidad }
    });
    throw error;
  }
} 