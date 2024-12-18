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

  interface OAuthRequest {
    code: string;
    client_id: string;
    client_secret: string;
    redirect_uri: string;
    grant_type: 'authorization_code';
  }

  interface OAuthCreateData {
    body: OAuthRequest;
  }

  class OAuth {
    constructor(client: MercadoPagoConfig);
    create(data: OAuthCreateData): Promise<{
      access_token: string;
      user_id: number;
      refresh_token: string;
    }>;
  }
} 