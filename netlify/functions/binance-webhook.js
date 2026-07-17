// netlify/functions/binance-webhook.js
// Webhook endpoint para recibir notificaciones de Binance Pay.
// Configura la misma BINANCE_API_SECRET en el entorno para verificar firma.

const crypto = require('crypto');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Netlify pasa body como string. Usamos event.body para verificar firma.
    const rawBody = event.body || '';
    const headers = event.headers || {};

    const timestamp = headers['binancepay-timestamp'] || headers['Binancepay-Timestamp'] || headers['BinancePay-Timestamp'];
    const signatureHeader = headers['binancepay-signature'] || headers['BinancePay-Signature'] || headers['Binancepay-Signature'];

    if (!timestamp || !signatureHeader) {
      console.warn('Missing signature headers');
      return { statusCode: 400, body: 'Missing signature headers' };
    }

    const secret = process.env.BINANCE_API_SECRET;
    if (!secret) {
      console.error('Missing BINANCE_API_SECRET');
      return { statusCode: 500, body: 'Server misconfigured' };
    }

    const prehash = `${timestamp}\n${rawBody}\n`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(prehash).digest('base64');

    if (expectedSignature !== signatureHeader) {
      console.warn('Invalid signature for webhook');
      return { statusCode: 401, body: 'Invalid signature' };
    }

    const payload = JSON.parse(rawBody);
    console.log('Binance webhook payload', payload);

    // TODO: verificar el tipo de evento y actualizar el estado de la orden en DB

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Error in webhook', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
