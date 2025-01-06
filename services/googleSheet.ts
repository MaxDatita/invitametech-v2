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

export async function getUnsentTickets(email: string): Promise<TicketData[]> {
  try {
    const doc = await getSpreadsheet();
    const sheet = doc.sheetsByTitle['Invitados'];
    if (!sheet) {
      throw new Error('No se encontró la hoja "Invitados"');
    }

    const rows = await sheet.getRows();
    const tickets: TicketData[] = [];

    console.log('Email buscado:', email);

    rows.forEach((row, index) => {
      const rowEmail = row.get('Email')?.trim();  // Columna D (texto)
      const enviado = row.get('Email Enviado');   // Columna I (checkbox)
      const id = row.get('ID');                   // Columna B (número)
      const qrCode = row.get('QR model');         // Columna Y (texto con URL)

      // Validaciones específicas
      const isValidId = !isNaN(Number(id));
      // Un checkbox en Google Sheets puede tener estos valores: TRUE, FALSE, o vacío
      const isNotSent = enviado !== 'TRUE' && enviado !== true;

      console.log(`Fila ${index + 2}:`, {
        rowEmail,
        emailBuscado: email,
        coincide: rowEmail === email,
        idValido: isValidId,
        enviado: enviado,
        rawValues: {
          email: rowEmail,
          enviado: enviado,
          id: id,
          qrCode: qrCode
        }
      });

      if (
        rowEmail === email && 
        isNotSent && 
        isValidId
      ) {
        console.log(`✅ Ticket válido encontrado en fila ${index + 2}`);
        tickets.push({
          ticketId: id,
          ticketType: row.get('Ticket'),
          qrCode: qrCode.replace('@', ''),
          rowIndex: index + 2
        });
      } else {
        console.log(`❌ Ticket no válido en fila ${index + 2}:`, {
          coincideEmail: rowEmail === email,
          noEnviado: isNotSent,
          idValido: isValidId
        });
      }
    });

    console.log(`Total tickets encontrados: ${tickets.length}`);
    return tickets;
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
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

    console.log('Marcando como enviados los tickets en filas:', rowIndexes);

    // Cargar todas las filas para obtener los headers
    const rows = await sheet.getRows();
    const headerRow = rows[0];
    
    // Encontrar el índice de la columna "Email Enviado"
    const headers = Object.keys(headerRow._rawData);
    const emailEnviadoIndex = headers.findIndex(header => header === 'Email Enviado');
    
    if (emailEnviadoIndex === -1) {
      throw new Error('No se encontró la columna "Email Enviado"');
    }

    console.log('Índice de columna Email Enviado:', emailEnviadoIndex);

    // Cargar y actualizar celdas en una sola operación
    await sheet.loadCells({
      startRowIndex: Math.min(...rowIndexes) - 1,
      endRowIndex: Math.max(...rowIndexes),
      startColumnIndex: emailEnviadoIndex,
      endColumnIndex: emailEnviadoIndex + 1,
    });

    // Actualizar todas las celdas de una vez
    for (const rowIndex of rowIndexes) {
      const cell = sheet.getCell(rowIndex - 1, emailEnviadoIndex);
      cell.value = true;
      console.log(`Marcando fila ${rowIndex} como enviada en columna ${emailEnviadoIndex}`);
    }

    // Guardar todos los cambios de una vez
    await sheet.saveUpdatedCells();
    console.log('Cambios guardados exitosamente');

    // Verificar que los cambios se guardaron
    const updatedRows = await sheet.getRows();
    rowIndexes.forEach(rowIndex => {
      const enviado = updatedRows[rowIndex - 1].get('Email Enviado');
      console.log(`Verificación - Fila ${rowIndex}: Email Enviado = ${enviado}`);
    });

    return true;
  } catch (error) {
    console.error('Error marcando tickets como enviados:', error);
    console.error('Detalles del error:', {
      message: error.message,
      stack: error.stack,
      error
    });
    throw error;
  }
} 