import axios from 'axios';

interface TicketEmailData {
  nombre: string;
  email: string;
  tipoTicket: string;
  quantity: number;
}

interface Ticket {
  ticketId: string;
  ticketType: string;
  qrCode: string;
  rowIndex: number;
}

interface EventData {
  eventName: string;
  organizerEmail: string;
}

// Función auxiliar para convertir imagen a base64
async function imageToBase64(url: string): Promise<string> {
  try {
    console.log('Intentando convertir a base64:', url);

    // Si la URL está vacía o es inválida, lanzar error
    if (!url) {
      throw new Error('URL de imagen vacía');
    }

    // Asegurarnos de que la URL es válida
    const validUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await axios.get(validUrl, {
      responseType: 'arraybuffer',
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Aceptar solo respuestas exitosas
      },
      timeout: 5000 // 5 segundos de timeout
    });

    if (!response.data) {
      throw new Error('No se recibieron datos de la imagen');
    }

    const buffer = Buffer.from(response.data, 'binary');
    const base64 = buffer.toString('base64');

    // Verificar que tenemos datos en base64
    if (!base64) {
      throw new Error('Error al convertir imagen a base64');
    }

    console.log('✅ Imagen convertida exitosamente a base64');
    return `data:image/png;base64,${base64}`;

  } catch (error) {
    if (error instanceof Error) {
      console.error('Error convirtiendo imagen a base64:', {
        url,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Error convirtiendo imagen a base64: ${error.message}`);
    } else {
      console.error('Error desconocido convirtiendo imagen a base64:', {
        url,
        error: String(error)
      });
      throw new Error(`Error desconocido convirtiendo imagen a base64: ${String(error)}`);
    }
  }
}

export async function sendTicketEmail(data: TicketEmailData) {
  try {
    // Obtener datos de Google Sheets
    const googleResponse = await fetch(`/api/google-sheets?email=${data.email}`);
    const { eventData, tickets } = await googleResponse.json() as { eventData: EventData; tickets: Ticket[] };

    if (!tickets || tickets.length === 0) {
      console.log('No hay tickets pendientes de envío para este email');
      return null;
    }

    // Convertir QRs a base64
    const ticketsWithBase64QR = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          console.log(`Procesando QR para ticket ${ticket.ticketId}`);
          const qrBase64 = await imageToBase64(ticket.qrCode);
          return {
            ...ticket,
            qrCode: qrBase64
          };
        } catch (error) {
          console.error(`Error procesando QR para ticket ${ticket.ticketId}:`, error);
          throw new Error(`Error procesando QR para ticket ${ticket.ticketId}: ${error instanceof Error ? error.message : String(error)}`);
        }
      })
    );

    // En lugar de convertir el logo a base64, lo servimos desde nuestro dominio
    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/public/eventechy-logo.png`;

    // Agrupamos los tickets por tipo para mostrarlos organizados
    const ticketsByType: { [key: string]: typeof ticketsWithBase64QR[0][] } = {};
    ticketsWithBase64QR.forEach((ticket) => {
      if (!ticketsByType[ticket.ticketType]) {
        ticketsByType[ticket.ticketType] = [];
      }
      ticketsByType[ticket.ticketType].push(ticket);
    });

    // Creamos el HTML con las imágenes
    const ticketsHtml = Object.entries(ticketsByType).map(([type, typeTickets]) => `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #ff7e33;">Tickets ${type}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          ${typeTickets.map((ticket) => `
            <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 10px 0;">ID: ${ticket.ticketId}</p>
              <img src="${ticket.qrCode}" alt="QR Code" style="width: 180px; height: 180px;"/>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${logoUrl}" alt="Eventechy" style="width: 200px;"/>
        </div>
        
        <h2 style="color: #ff7e33;">Tickets del evento: ${eventData.eventName}</h2>
        
        <p>Hola {{nombre}}! Te acercamos tus entradas. Debes presentarlas en puerta.</p>
        
        <p style="color: #666;"><strong>Nota:</strong> No es necesario imprimir el email, puedes presentarlo desde tu dispositivo teléfono móvil.</p>
        
        ${ticketsHtml}
        
        <div style="color: #666; font-size: 12px; margin-top: 30px;">
          <p>Eventechy es solo el intermediario entre el evento y los asistentes al mismo. No respondas este email ya que es solo transaccional, si requieres más información o tienes inconvenientes con tus tickets, contacta al organizador del evento mediante el botón debajo.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="mailto:${eventData.organizerEmail}" style="background-color: #ff7e33; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contactar Soporte</a>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p>Visítanos en <a href="www.eventechy.com" style="color: #ff7e33;">www.eventechy.com</a></p>
        </div>
      </div>
    `;

    // En lugar de llamar directamente a Envialo Simple, usamos nuestro endpoint
    const emailResponse = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.email,
        subject: `Tus tickets para ${eventData.eventName}`,
        html: emailHtml,
        substitutions: {
          nombre: data.nombre
        }
      })
    });

    const responseData = await emailResponse.json();
    console.log('Respuesta del servidor de email:', responseData);

    // Verificamos si el email fue encolado correctamente
    if (responseData.queued) {
      console.log('Email encolado exitosamente, intentando marcar tickets...', {
        emailId: responseData.id,
        rowIndexes: tickets.map(ticket => ticket.rowIndex)
      });

      // Marcar los tickets como enviados
      const markResponse = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowIndexes: tickets.map(ticket => ticket.rowIndex)
        }),
      });

      const markResult = await markResponse.json();
      console.log('Resultado de marcar tickets:', markResult);

      if (!markResult.success) {
        console.error('Error al marcar tickets:', markResult.error);
        throw new Error(markResult.error);
      }
    } else {
      console.error('El email no fue encolado correctamente:', responseData);
      throw new Error('Error al encolar el email');
    }

    return responseData;
  } catch (error) {
    console.error('Error en el proceso de envío:', error);
    throw error;
  }
} 