// netlify/functions/binance-create-order.js
// Netlify Function that creates an order with Binance Pay and stores the order in Firestore (Admin SDK).
// Requires env vars: BINANCE_API_KEY, BINANCE_API_SECRET, BINANCE_MERCHANT_ID, FIREBASE_SERVICE_ACCOUNT_BASE64

const crypto = require('crypto');
const fetch = global.fetch || require('node-fetch');
const { initAdmin } = require('./_admin');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const { db } = initAdmin();

    const body = JSON.parse(event.body || '{}');
    const { amount = 0, currency = 'USD', orderId = `order-${Date.now()}`, description = '' } = body;

    const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
    const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;
    const BINANCE_MERCHANT_ID = process.env.BINANCE_MERCHANT_ID;
    const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://bpay.binanceapi.com';

    if (!BINANCE_API_KEY || !BINANCE_API_SECRET || !BINANCE_MERCHANT_ID) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Binance credentials not configured' }) };
    }

    // Prepare payload according to Binance Pay API. Adjust fields as required by Binance.
    const payload = {
      merchantTradeNo: orderId,
      merchantId: BINANCE_MERCHANT_ID,
      totalAmount: Number(amount),
      currency: currency,
      productName: description || 'Compra iCheckerPro',
      // add more fields per Binance Pay docs if needed
    };

    const payloadStr = JSON.stringify(payload);
    const timestamp = Math.floor(Date.now() / 1000).toString();
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

    // Store the order in Firestore
    const ordersRef = db.collection('orders');
    const orderDoc = {
      orderId,
      amount: Number(amount),
      currency,
      description,
      createdAt: new Date().toISOString(),
      binanceResponse: data,
      status: 'pending'
    };

    const docRef = await ordersRef.add(orderDoc);

    // Return the Binance response plus our order doc id
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data, orderDocId: docRef.id })
    };
  } catch (err) {
    console.error('Error in binance-create-order', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: String(err) }) };
  }
};
