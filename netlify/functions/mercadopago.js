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
      const MP_MODE = (process.env.MP_MODE || 'production').toLowerCase(); // 'production' or 'test'

      // Temporary logs for debugging environment and response (do not log sensitive tokens)
      console.log('[mercadopago] MP_MODE=', MP_MODE);
      console.log('[mercadopago] MP_ACCESS_TOKEN configured=', !!MP_ACCESS_TOKEN);

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
        external_reference: body.user_id ?? undefined,
        binary_mode: false,
      };

      if (origin) {
        preference.back_urls = {
          success: `${origin}/dashboard?payment=success`,
          failure: `${origin}/dashboard?payment=failed`,
          pending: `${origin}/dashboard?payment=pending`,
        };
      }

      const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });

      const data = await resp.json();

      // Log which init URLs the API returned for debugging
      console.log('[mercadopago] response has init_point=', !!data.init_point, 'sandbox_init_point=', !!data.sandbox_init_point);

      if (!resp.ok) {
        console.error('MercadoPago API error', data);
        return { statusCode: resp.status || 500, body: JSON.stringify({ message: 'MercadoPago API error', data }) };
      }

      const result = {
        init_point: data.init_point ?? null,
        sandbox_init_point: data.sandbox_init_point ?? null,
        preference: data,
      };

      if (MP_MODE === 'production') {
        if (!result.init_point && result.sandbox_init_point) {
          console.warn('[mercadopago] MP_MODE=production but MercadoPago returned only sandbox_init_point. This usually means the access token provided is a sandbox/test token or the MercadoPago account is not enabled for production checkout.');
        }
      }

      return { statusCode: 200, body: JSON.stringify(result) };
    }

    return { statusCode: 400, body: JSON.stringify({ message: 'Missing or unknown action' }) };
  } catch (err) {
    console.error('Error in mercadopago function', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error', error: String(err) }) };
  }
};
