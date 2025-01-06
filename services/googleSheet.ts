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

    console.log('Intentando marcar como enviados los tickets en filas:', rowIndexes);

    // Obtener todas las filas
    const rows = await sheet.getRows();
    
    // Actualizar cada fila
    for (const rowIndex of rowIndexes) {
      try {
        // Ajustar el índice (restar 2 porque la primera fila es header y los índices empiezan en 0)
        const adjustedIndex = rowIndex - 2;
        const row = rows[adjustedIndex];
        
        if (!row) {
          console.error(`Fila ${rowIndex} no encontrada (índice ajustado: ${adjustedIndex})`);
          continue;
        }

        // Imprimir el estado actual de la fila
        console.log(`Estado actual de fila ${rowIndex}:`, {
          email: row.get('Email'),
          enviado: row.get('Email Enviado')
        });

        // Actualizar el valor - usando el método correcto
        row.set('Email Enviado', 'TRUE');

        // Guardar la fila
        await row.save();
        
        console.log(`✅ Fila ${rowIndex} marcada como enviada`);
      } catch (rowError) {
        console.error(`Error al procesar fila ${rowIndex}:`, rowError);
      }
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al marcar tickets como enviados:', {
        error: error.message,
        stack: error.stack,
        rowIndexes
      });
    } else {
      console.error('Error al marcar tickets como enviados:', {
        error: String(error),
        rowIndexes
      });
    }
    throw new Error(`Error al marcar tickets como enviados: ${error.message}`);
  }
} 