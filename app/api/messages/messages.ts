import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Configurar CORS si es necesario
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  if (req.method === 'POST') {
    try {
      const { fecha, nombre, mensaje } = req.body;
      console.log('Recibiendo mensaje:', { fecha, nombre, mensaje }); // Para debug

      const jwt = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
      await doc.loadInfo();
      
      const sheet = doc.sheetsByIndex[0];
      
      await sheet.addRow({
        Fecha: fecha,
        Nombre: nombre,
        Mensaje: mensaje
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error en el servidor:', error);
      res.status(500).json({ error: 'Error al guardar el mensaje' });
    }
  } else if (req.method === 'GET') {
    // Tu código existente para GET
    try {
      const jwt = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();

      const messages = rows.map((row, index) => ({
        id: index,
        nombre: row.get('Nombre'),
        mensaje: row.get('Mensaje')
      }));

      res.status(200).json(messages);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener los mensajes' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}