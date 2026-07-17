import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN") ?? "";

interface CreatePreferenceBody {
  amount: number;
  user_id: string;
  email: string;
  origin?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "create";

  try {
    // ─── Create preference (checkout) ───────────────────────────────
    if (action === "create" && req.method === "POST") {
      if (!MP_ACCESS_TOKEN) {
        return new Response(
          JSON.stringify({ error: "MercadoPago not configured. Add MERCADOPAGO_ACCESS_TOKEN secret." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { amount, user_id, email, origin } = (await req.json()) as CreatePreferenceBody;
      const appOrigin = origin || url.origin;

      if (!amount || amount <= 0 || !user_id) {
        return new Response(
          JSON.stringify({ error: "Invalid amount or user_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Create a pending transaction record
      const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          user_id,
          amount,
          type: "topup",
          status: "pending",
          provider: "mercadopago",
        }),
      });
      const txText = await txRes.text();
      const tx = txText ? JSON.parse(txText) : [];
      const transactionId = tx?.[0]?.id;

      // Create MercadoPago preference
      const prefRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          items: [
            {
              id: `topup-${transactionId ?? "na"}`,
              title: `iCheckerPro — Wallet Top-up ${amount}`,
              quantity: 1,
              unit_price: Number(amount),
              currency_id: "USD",
            },
          ],
          payer: { email },
          back_urls: {
            success: `${appOrigin}/dashboard?payment=success`,
            pending: `${appOrigin}/dashboard?payment=pending`,
            failure: `${appOrigin}/dashboard?payment=failure`,
          },
          auto_return: "approved",
          notification_url: `${SUPABASE_URL}/functions/v1/mercadopago?action=webhook`,
          external_reference: `${user_id}:${transactionId ?? ""}`,
          metadata: { user_id, transaction_id: transactionId, amount },
        }),
      });
      const prefText = await prefRes.text();

      if (!prefRes.ok) {
        let errMsg = "Failed to create preference";
        try { errMsg = JSON.parse(prefText)?.message ?? errMsg; } catch { /* not JSON */ }
        return new Response(
          JSON.stringify({ error: errMsg }),
          { status: prefRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let pref: any;
      try { pref = JSON.parse(prefText); } catch { pref = {}; }

      return new Response(
        JSON.stringify({
          init_point: pref.init_point,
          sandbox_init_point: pref.sandbox_init_point,
          preference_id: pref.id,
          transaction_id: transactionId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── Webhook (payment notification) ─────────────────────────────
    if (action === "webhook" && (req.method === "POST" || req.method === "GET")) {
      let body: any = null;
      if (req.method === "POST") {
        body = await req.json().catch(() => null);
      } else {
        const topic = url.searchParams.get("topic");
        const id = url.searchParams.get("id") ?? url.searchParams.get("data.id");
        if (topic && id) body = { topic, data: { id } };
      }

      if (!body) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Extract payment ID
      const paymentId =
        body.data?.id ??
        body.resource?.split("/")?.pop() ??
        body.id;

      if (!paymentId) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch payment details from MP
      const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });
      const payText = await payRes.text();
      let payment: any = null;
      try { payment = JSON.parse(payText); } catch { /* not JSON */ }

      if (!payRes.ok || !payment) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Only credit on approved payments
      if (payment.status === "approved") {
        const metadata = payment.metadata ?? {};
        const userId = metadata.user_id;
        const transactionId = metadata.transaction_id;
        const amount = Number(metadata.amount ?? payment.transaction_amount ?? 0);

        if (userId && amount > 0) {
          // Update transaction status
          if (transactionId) {
            await fetch(`${SUPABASE_URL}/rest/v1/transactions?id=eq.${transactionId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                apikey: SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                status: "completed",
                provider_payment_id: String(paymentId),
              }),
            });
          }

          // Credit balance atomically
          await fetch(`${SUPABASE_URL}/rest/v1/rpc/credit_balance`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ p_user_id: userId, p_amount: amount }),
          });
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" } ,
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
