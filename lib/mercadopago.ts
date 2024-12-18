import { MercadoPagoConfig, Preference } from "mercadopago";

// Configurar MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

const preference = new Preference(client);

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
  const preferenceData = {
    items: data.items,
    payer: data.payer,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?name=${encodeURIComponent(data.payer.name)}&email=${encodeURIComponent(data.payer.email)}&ticketType=${encodeURIComponent(data.items[0].id)}&quantity=${data.items[0].quantity}`,
      failure: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/failure`,
      pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending`,
    },
    auto_return: "approved",
  };

  try {
    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error('Error creating preference:', error);
    throw error;
  }
} 