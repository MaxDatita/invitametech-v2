declare module 'mercadopago' {
  interface PreferenceCreateData {
    items: Array<{
      id: string;
      title: string;
      unit_price: number;
      quantity: number;
    }>;
    payer?: {
      name: string;
      email: string;
    };
    back_urls?: {
      success: string;
      failure: string;
      pending: string;
    };
    auto_return?: string;
  }

  class Preference {
    constructor(client: MercadoPagoConfig);
    create(data: PreferenceCreateData): Promise<PreferenceResponse>;
  }

  class MercadoPagoConfig {
    constructor(options: { accessToken: string });
  }

  interface PreferenceResponse {
    id: string;
    init_point: string;
    sandbox_init_point: string;
  }

  interface OAuthCreateData {
    body: {
      grant_type: string;
      code: string;
      client_id: string;
      client_secret: string;
      redirect_uri: string;
    }
  }

  interface OAuthRequest {
    grant_type: 'authorization_code';
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
  }

  class OAuth {
    constructor(client: MercadoPagoConfig);
    create(data: { body: OAuthRequest }): Promise<{
      access_token: string;
      user_id: number;
      refresh_token: string;
    }>;
  }
} 