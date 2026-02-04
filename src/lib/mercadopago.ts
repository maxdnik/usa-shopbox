import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * Inicialización oficial del cliente de Mercado Pago
 * 🛠️ AJUSTADO: Usando tu nueva variable MP_ACCESS_TOKEN
 */
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

// Exportamos la instancia de Preference para crear los links de pago
export const preference = new Preference(client);