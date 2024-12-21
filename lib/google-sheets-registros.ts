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
    console.log('Starting addInvitado with data:', data);
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    console.log('JWT created successfully');

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();
    console.log('Document loaded successfully');
    
    const sheet = doc.sheetsByTitle['Invitados'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Invitados"');
    }
    console.log('Sheet found successfully');

    // Obtener todas las filas y encontrar la última fila con datos en la columna A
    const rows = await sheet.getRows();
    console.log('Current rows count:', rows.length);

    const quantity = parseInt(String(data.quantity) || '1', 10);
    console.log('Processing quantity:', quantity);

    for (let i = 0; i < quantity; i++) {
      console.log(`Processing row ${i + 1} of ${quantity}`);
      
      const now = new Date();
      now.setHours(now.getHours() - 3); // Ajusta el desfase horario (-3 para Argentina)
      const argentinaTime = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);

      // Crear nueva fila con datos
      const rowData = {
        'Fecha': argentinaTime,
        'Invitado': data.nombre,
        'Email': data.email,
        'Ticket': data.tipoTicket.split('(')[0].trim(),
      };
      console.log('Adding row with data:', rowData);

      try {
        await sheet.addRow(rowData);
        console.log('Row added successfully');
      } catch (rowError) {
        console.error('Error adding individual row:', rowError);
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
  } catch (error) {
    console.error('Error saving seller token:', error);
    throw error;
  }
}

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