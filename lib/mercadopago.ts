import { MercadoPagoConfig, Preference } from "mercadopago";
import { getSellerToken } from '@/lib/google-sheets-registros';

export interface CreatePreferenceData {
  items: Array<{
    id: string;
    title: string;
    unit_price: number;
    quantity: number;
  }>;
  payer: {
    name: string;
    email: string;
  };
}

export async function createPreference(data: CreatePreferenceData) {
  try {
    // Obtener el token del vendedor de Google Sheetss
    const sellerToken = await getSellerToken();
    if (!sellerToken) {
      throw new Error('No seller token found');
    }

    // Crear cliente con el token del vendedor
    const client = new MercadoPagoConfig({ 
      accessToken: sellerToken 
    });
    
    const preference = new Preference(client);

    // Calcular el total de la operación
    const totalAmount = data.items.reduce((total, item) => 
      total + (item.unit_price * item.quantity), 0
    );

    // Calcular el fee como un porcentaje (por ejemplo, 10%)
    const FEE_PERCENTAGE = 10;
    const marketplace_fee = (totalAmount * FEE_PERCENTAGE) / 100;

    const preferenceData = {
      items: data.items,
      payer: data.payer,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?name=${encodeURIComponent(data.payer.name)}&email=${encodeURIComponent(data.payer.email)}&ticketType=${encodeURIComponent(data.items[0].id)}&quantity=${data.items[0].quantity}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
      },
      auto_return: "approved",
      marketplace_fee, // Fee calculado como porcentaje
    };

    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creating preference:', error);
    throw error;
  }
} 