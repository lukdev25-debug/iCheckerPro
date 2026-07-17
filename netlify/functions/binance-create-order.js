// netlify/functions/binance-create-order.js
// Netlify Function que crea una orden en Binance Pay (ejemplo).
// NO incluye las claves en el código. Configura las variables de entorno en Netlify:
// BINANCE_API_KEY, BINANCE_API_SECRET, BINANCE_MERCHANT_ID, BINANCE_API_URL (opcional)

const crypto = require('crypto');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { amount = 0, currency = 'USD', orderId = `order-${Date.now()}`, description = '' } = body;

    const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
    const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;
    const BINANCE_MERCHANT_ID = process.env.BINANCE_MERCHANT_ID;
    const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://bpay.binanceapi.com';

    if (!BINANCE_API_KEY || !BINANCE_API_SECRET || !BINANCE_MERCHANT_ID) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Binance credentials not configured' }) };
    }

    // Construir el payload según la API de Binance Pay. Ajusta los campos según la documentación oficial.
    const payload = {
      merchantTradeNo: orderId,
      merchantId: BINANCE_MERCHANT_ID,
      totalAmount: amount, // verificar si la API espera int (cents) o string
      currency: currency,
      productName: description || 'Compra iCheckerPro',
      // otros campos requeridos por Binance Pay
    };

    const payloadStr = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Ejemplo de firma: CONCAT(timestamp, '\\n', payload, '\\n') y HMAC-SHA256 then base64
    const prehash = `${timestamp}\n${payloadStr}\n`;
    const signature = crypto.createHmac('sha256', BINANCE_API_SECRET).update(prehash).digest('base64');

    const fetchResp = await fetch(`${BINANCE_API_URL}/binancepay/openapi/v2/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp,
        'BinancePay-ApiKey': BINANCE_API_KEY,
        'BinancePay-Signature': signature
      },
      body: payloadStr
    });

    const data = await fetchResp.json();

    if (!fetchResp.ok) {
      console.error('Binance API error', data);
      return { statusCode: fetchResp.status || 500, body: JSON.stringify({ message: 'Binance API error', data }) };
    }

    // Devuelve la información necesaria al frontend (checkoutUrl / qrCodeUrl / etc.)
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (err) {
    console.error('Error en binance-create-order', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: String(err) }) };
  }
};
