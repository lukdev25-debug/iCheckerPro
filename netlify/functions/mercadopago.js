export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
    }

    const params = event.queryStringParameters || {};
    const action = params.action || null;
    const body = JSON.parse(event.body || '{}');

    if (action === 'create') {
      const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
      if (!MP_ACCESS_TOKEN) {
        return { statusCode: 500, body: JSON.stringify({ message: 'MP_ACCESS_TOKEN not configured' }) };
      }

      const amount = Number(body.amount || 0);
      const email = body.email || '';
      const origin = body.origin || process.env.ORIGIN_URL || '';
      const currency = process.env.MP_CURRENCY || 'USD';

      const preference = {
        items: [
          {
            title: 'Wallet Top-up',
            quantity: 1,
            unit_price: amount,
            currency_id: currency,
          },
        ],
        payer: {
          email,
        },
        back_urls: origin
          ? {
              success: `${origin}/dashboard?payment=success`,
              failure: `${origin}/dashboard?payment=failed`,
              pending: `${origin}/dashboard?payment=pending`,
            }
          : undefined,
        external_reference: body.user_id ?? undefined,
        binary_mode: false,
      };

      const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.error('MercadoPago API error', data);
        return { statusCode: resp.status || 500, body: JSON.stringify({ message: 'MercadoPago API error', data }) };
      }

      // Return the preference object (contains init_point / sandbox_init_point)
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    return { statusCode: 400, body: JSON.stringify({ message: 'Missing or unknown action' }) };
  } catch (err) {
    console.error('Error in mercadopago function', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: String(err) }) };
  }
};
