import { initAdmin } from './_admin.js';

// Webhook handler for MercadoPago notifications
// Configure your MercadoPago webhook URL to point to:
// https://<YOUR_SITE>/.netlify/functions/mercadopago-webhook

export const handler = async (event) => {
  try {
    // Accept POST (webhooks) and GET (health check)
    if (event.httpMethod === 'GET') {
      return { statusCode: 200, body: JSON.stringify({ ok: true, message: 'mercadopago-webhook alive' }) };
    }

    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) {
      console.error('[mp-webhook] MP_ACCESS_TOKEN not configured');
      return { statusCode: 500, body: JSON.stringify({ message: 'MP_ACCESS_TOKEN not configured' }) };
    }

    // Parse body (MercadoPago sends JSON with either {id, topic} or a more detailed payload)
    let payload = {};
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      console.warn('[mp-webhook] Failed to parse JSON body, attempting URLSearchParams');
      const params = new URLSearchParams(event.body || '');
      for (const [k, v] of params.entries()) payload[k] = v;
    }

    // Determine resource id. MercadoPago can send { id, topic } or { data: { id } }
    const resourceId = payload.id || (payload.data && payload.data.id) || (payload.resource && payload.resource.id) || null;
    const topic = payload.topic || payload.type || null;

    if (!resourceId) {
      console.warn('[mp-webhook] No resource id found in payload', payload);
      return { statusCode: 400, body: JSON.stringify({ message: 'No resource id in webhook payload' }) };
    }

    // Initialize admin SDK
    const { admin, db } = await initAdmin();

    // Fetch payment details from MercadoPago to validate
    const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const payment = await paymentResp.json();
    if (!paymentResp.ok) {
      console.error('[mp-webhook] Failed to fetch payment details', payment);
      // still store the raw webhook for troubleshooting
      await db.collection('mp_webhooks').add({ payload, fetched: payment, receivedAt: new Date().toISOString() });
      return { statusCode: 502, body: JSON.stringify({ message: 'Failed to fetch payment details', detail: payment }) };
    }

    // Build transaction doc
    const tx = {
      provider: 'mercadopago',
      payment_id: payment.id || resourceId,
      status: payment.status || null,
      status_detail: payment.status_detail || null,
      amount: payment.transaction_amount || payment.transaction_amount_refunded || 0,
      currency: payment.currency_id || null,
      external_reference: payment.external_reference || null,
      payer: payment.payer || null,
      raw: payment,
      topic: topic,
      receivedAt: new Date().toISOString(),
    };

    // Save transaction record
    const txRef = await db.collection('transactions').add(tx);

    // If payment is approved, credit user's balance (if external_reference is present and looks like a user id)
    if (tx.status === 'approved' || tx.status === 'paid' || tx.status === 'authorized') {
      const userId = tx.external_reference;
      if (userId) {
        try {
          const userRef = db.collection('users').doc(String(userId));
          // Increment balance by the amount (assumes balance is stored as number)
          await userRef.set({ balance: admin.firestore.FieldValue.increment(tx.amount) }, { merge: true });
          // Also record a completed transaction mapping
          await db.collection('transactions').doc(txRef.id).update({ processed: true, creditedTo: userId });
        } catch (e) {
          console.error('[mp-webhook] Failed to credit user balance', e);
          await db.collection('mp_webhook_errors').add({ error: String(e), txRef: txRef.id, createdAt: new Date().toISOString() });
        }
      } else {
        // No external reference — keep the transaction for manual reconciliation
        await db.collection('mp_webhook_errors').add({ message: 'No external_reference to credit', txRef: txRef.id, paymentId: tx.payment_id, createdAt: new Date().toISOString() });
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('[mp-webhook] Unexpected error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: String(err) }) };
  }
};
