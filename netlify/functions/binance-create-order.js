import crypto from 'crypto';
import fetch from 'node-fetch';
import { initAdmin } from './_admin.js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const { db } = await initAdmin();

    const body = JSON.parse(event.body || '{}');
    const { amount = 0, currency = 'USD', orderId = `order-${Date.now()}`, description = '' } = body;

    const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
    const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;
    const BINANCE_MERCHANT_ID = process.env.BINANCE_MERCHANT_ID;
    const BINANCE_API_URL = process.env.BINANCE_API_URL || 'https://bpay.binanceapi.com';

    if (!BINANCE_API_KEY || !BINANCE_API_SECRET || !BINANCE_MERCHANT_ID) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Binance credentials not configured' }) };
    }

    const payload = {
      merchantTradeNo: orderId,
      merchantId: BINANCE_MERCHANT_ID,
      totalAmount: Number(amount),
      currency,
      productName: description || 'Compra iCheckerPro',
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

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data, orderDocId: docRef.id })
    };
  } catch (err) {
    console.error('Error in binance-create-order', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: String(err) }) };
  }
};
