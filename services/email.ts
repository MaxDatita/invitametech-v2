import axios from 'axios';
import { getEventData, getTicketsByEmail, markTicketsAsSent } from './googleSheet';

interface TicketEmailData {
  nombre: string;
  email: string;
  tipoTicket: string;
  quantity: number;
}

export async function sendTicketEmail(data: TicketEmailData) {
  try {
    // Obtener datos del evento
    const { eventName, organizerEmail } = await getEventData();
    
    // Obtener tickets del usuario que no han sido enviados
    const tickets = await getTicketsByEmail(data.email);

    // Si no hay tickets pendientes de envío, retornamos
    if (tickets.length === 0) {
      console.log('No hay tickets pendientes de envío para este email');
      return null;
    }

    // Crear HTML para cada ticket
    const ticketsHtml = tickets.map(ticket => `
      <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h3 style="color: #ff7e33;">Ticket ${ticket.ticketType} ID: ${ticket.ticketId}</h3>
        <img src="${ticket.qrCode}" alt="QR Code" style="width: 200px; height: 200px;"/>
      </div>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${process.env.NEXT_PUBLIC_BASE_URL}/images/logo.png" alt="Eventechy" style="width: 150px;"/>
        </div>
        
        <h2 style="color: #ff7e33;">Tickets del evento: ${eventName}</h2>
        
        <p>Hola! Te acercamos tu/s entrada/s. Debes presentarla/s en puerta.</p>
        
        <p style="color: #666;"><strong>Nota:</strong> No es necesario imprimir el email, puedes presentarlo desde tu dispositivo teléfono móvil.</p>
        
        ${ticketsHtml}
        
        <div style="color: #666; font-size: 12px; margin-top: 30px;">
          <p>Eventechy es solo el intermediario entre el evento y los asistentes al mismo. No respondas este email ya que es solo transaccional, si requieres más información o tienes inconvenientes con tu ticket, contacta al organizador del evento mediante el botón debajo.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="mailto:${organizerEmail}" style="background-color: #ff7e33; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Contactar Soporte</a>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p>Visítanos en <a href="www.eventechy.com" style="color: #ff7e33;">www.eventechy.com</a></p>
        </div>
      </div>
    `;

    const response = await axios.post(
      'https://api.envialosimple.com/api/v1/send',
      {
        api_key: process.env.ENVIALO_SIMPLE_API_KEY,
        from: process.env.SENDER_EMAIL,
        to: data.email,
        subject: `Tus tickets para ${eventName}`,
        html: emailHtml,
      }
    );

    // Si el envío fue exitoso, marcamos los tickets como enviados
    if (response.data) {
      await markTicketsAsSent(tickets.map(ticket => ticket.rowIndex));
    }

    return response.data;
  } catch (error) {
    console.error('Error enviando el email:', error);
    throw new Error('No se pudo enviar el email del ticket');
  }
} 