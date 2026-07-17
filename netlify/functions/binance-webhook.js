// netlify/functions/binance-webhook.js
// Webhook endpoint to receive notifications from Binance Pay and update order status in Firestore (Admin SDK).
// Requires FIREBASE_SERVICE_ACCOUNT_BASE64 and BINANCE_API_SECRET to verify signature.

const crypto = require('crypto');
const { initAdmin } = require('./_admin');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { db } = initAdmin();

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

    // Example payload may contain merchantTradeNo or tradeNo or paymentId depending on event type
    const merchantTradeNo = payload?.merchantTradeNo || payload?.data?.merchantTradeNo || null;
    const tradeId = payload?.tradeId || payload?.data?.orderId || null;

    // Update the order document in Firestore if we can find it by orderId
    if (merchantTradeNo) {
      const ordersRef = db.collection('orders');
      const snapshot = await ordersRef.where('orderId', '==', merchantTradeNo).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const update = { status: 'paid', lastWebhook: payload, updatedAt: new Date().toISOString() };
        await doc.ref.update(update);
        console.log('Order updated', doc.id);
      } else {
        console.warn('Order not found for merchantTradeNo', merchantTradeNo);
      }
    }

    return { statusCode: 200, body: 'OK' };
  } catch (err) {
    console.error('Error in webhook', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
