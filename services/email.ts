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
    const { eventName, organizerEmail } = await getEventData();
    const tickets = await getTicketsByEmail(data.email);

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
        
        <p>Hola {{nombre}}! Te acercamos tu/s entrada/s. Debes presentarla/s en puerta.</p>
        
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

    const payload = JSON.stringify({
      from: "tickets@eventechy.com",
      to: data.email,
      subject: `Tus tickets para ${eventName}`,
      html: emailHtml,
      substitutions: {
        nombre: data.nombre
      }
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.envialosimple.email/api/v1/mail/send',
      headers: { 
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3MzU5NDE1OTAsImV4cCI6NDg5MTYxNTE5MCwicm9sZXMiOlsiUk9MRV9BRE1JTiIsIlJPTEVfVVNFUiJdLCJraWQiOiI2Nzc4NWRkNmZkODMwMDFiMGYwY2E3NWQiLCJhaWQiOiI2Nzc0MGI1OTJmNjY3NTUzYTQwM2I4YjUiLCJ1c2VybmFtZSI6ImRhdGl0YS5pbmZvQGdtYWlsLmNvbSJ9.D3an38w9ZbI8b0HBu7C6-TrR00A5QYRAEqhxgSp0IrGOMqT4hZwAUP_PYgMIIg60V007eYI5IXwZwrEmsGsZmJ96iJdQSatNqMaPzVJmc_gUZzhLB_RsNrYb0fR7wZHeaXNA_ajmaylI15ARMSYwX83WdtEYSc6s_0j7BJPN58_jCudU_4XJjAakVrl04Oo0XKqfYgfjro3wZBdUfk7tq1G1m6QrMe7kbW2-SnMBYI4pK9Tm8NgKK8wwT9AOM0t1fKAgOUQ99BbiGAEveVHrz3018fdfjjjneN1ggJOv3ggds0uo4er9wJdsOX2y2V69WBrAdlwIRh5QtxIzrhaQqQ`,
        'Content-Type': 'application/json'
      },
      data: payload
    };

    const response = await axios(config);
    console.log('Respuesta de Envialo Simple:', response.data);

    if (response.data.success) {
      await markTicketsAsSent(tickets.map(ticket => ticket.rowIndex));
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error enviando el email:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
    } else {
      console.error('Error enviando el email:', error);
    }
    throw error;
  }
} 