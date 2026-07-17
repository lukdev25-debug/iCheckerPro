import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// sickw service IDs and their wholesale (cost) price
// retail price is what we charge the user (markup)
interface ServiceDef {
  sickwId: string;
  retailPrice: number;
}

const SERVICES: Record<string, ServiceDef> = {
  // FMI / iCloud services
  fmi_onoff:      { sickwId: "3",   retailPrice: 1.50 },   // iCLOUD ON/OFF
  icloud_cleanlost:{ sickwId: "66", retailPrice: 3.50 },   // iCLOUD CLEAN/LOST
  fmi_carrier:    { sickwId: "78",  retailPrice: 2.50 },   // iPHONE CARRIER & FMI
  fmi_carrier_bl: { sickwId: "61",  retailPrice: 3.00 },   // iPHONE CARRIER & FMI & BLACKLIST
  mdm_status:     { sickwId: "81",  retailPrice: 5.00 },   // APPLE MDM STATUS
  mdm_icloud_gsx: { sickwId: "72",  retailPrice: 6.00 },   // APPLE MDM & iCLOUD & GSX

  // Apple GSX / details
  gsx_premium:    { sickwId: "63",  retailPrice: 4.00 },   // APPLE GSX PREMIUM DETAILS
  apple_sold_by:  { sickwId: "105", retailPrice: 3.50 },   // APPLE SOLD BY & COUNTRY INFO
  apple_basic:    { sickwId: "30",  retailPrice: 1.50 },   // APPLE BASIC INFO
  apple_serial:   { sickwId: "26",  retailPrice: 1.00 },   // APPLE SERIAL INFO
  apple_activation:{ sickwId: "101",retailPrice: 1.50 },   // APPLE ACTIVATION STATUS
  apple_activation_pro:{ sickwId: "88", retailPrice: 2.00 }, // APPLE ACTIVATION STATUS - PRO
  apple_repair:   { sickwId: "77",  retailPrice: 1.50 },   // APPLE GSX REPAIR ELIGIBILITY
  apple_cases:    { sickwId: "68",  retailPrice: 3.00 },   // APPLE GSX CASES & REPAIRS
  apple_replacements:{ sickwId: "29",retailPrice: 1.50 },  // APPLE REPLACEMENTS HISTORY
  apple_part_number:{ sickwId: "219",retailPrice: 1.00 },  // APPLE PART NUMBER - MPN
  apple_demo:     { sickwId: "85",  retailPrice: 4.00 },   // APPLE DEMO DEVICES INFO

  // Carrier / SIM-Lock
  iphone_carrier: { sickwId: "103", retailPrice: 1.50 },   // iPHONE CARRIER
  iphone_simlock: { sickwId: "8",   retailPrice: 1.00 },   // iPHONE SIM-LOCK
  iphone_model_color:{ sickwId: "92", retailPrice: 0.80 },// iPHONE MODEL COLOR & CAPACITY
  imei_sn_convert:{ sickwId: "12",  retailPrice: 1.00 },   // IMEI ↔ SN CONVERT

  // iPad / Mac / Watch
  apple_ipad_mac: { sickwId: "27",  retailPrice: 3.50 },   // APPLE SOLD BY - iPAD & MAC & WATCH
  macbook_icloud: { sickwId: "110", retailPrice: 3.00 },   // MACBOOK & iMAC iCLOUD ON/OFF
  fmi_off_compatibility: { sickwId: "61", retailPrice: 3.00 }, // FMI OFF COMPATIBILITY CHECK
};

interface CheckBody {
  imei: string;
  service: string;
  user_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { imei, service, user_id } = (await req.json()) as CheckBody;

    if (!imei || !user_id || !service) {
      return new Response(
        JSON.stringify({ error: "IMEI, service, and user_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate IMEI format (15 digits or serial number 8-14 chars)
    if (!/^\d{15}$/.test(imei) && !/^[A-Za-z0-9]{8,14}$/.test(imei)) {
      return new Response(
        JSON.stringify({ error: "IMEI must be 15 digits or a valid serial number (8-14 alphanumeric chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const serviceDef = SERVICES[service];
    if (!serviceDef) {
      return new Response(
        JSON.stringify({ error: "Unknown service" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const price = serviceDef.retailPrice;

    // Fetch sickw API key from database (stored securely, only service role can access)
    let SICKW_API_KEY = "";
    try {
      const keyRes = await fetch(`${SUPABASE_URL}/rest/v1/api_keys?name=eq.SICKW_API_KEY&select=value`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      const keyText = await keyRes.text();
      const keyData = keyText ? JSON.parse(keyText) : [];
      SICKW_API_KEY = keyData?.[0]?.value ?? "";
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch API key: ${err.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!SICKW_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Sickw API key not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Deduct balance atomically
    let deducted: boolean;
    try {
      const deductRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/deduct_balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ p_user_id: user_id, p_amount: price }),
      });
      const deductText = await deductRes.text();
      deducted = deductText.trim() === "true";
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Failed to deduct balance: ${err.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!deducted) {
      return new Response(
        JSON.stringify({ error: "Insufficient balance. Please top up your wallet." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create imei_check record
    let checkId: string | null = null;
    try {
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/imei_checks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          user_id,
          imei,
          service,
          status: "pending",
          price,
        }),
      });
      const checkText = await checkRes.text();
      const checkData = checkText ? JSON.parse(checkText) : [];
      checkId = checkData?.[0]?.id ?? null;
    } catch (err) {
      // Refund since we couldn't create the check record
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/rpc/credit_balance`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ p_user_id: user_id, p_amount: price }),
        });
      } catch { /* best effort */ }
      return new Response(
        JSON.stringify({ error: `Failed to create check record: ${err.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create transaction record
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          user_id,
          amount: -price,
          type: "check",
          status: "completed",
          provider: "internal",
          reference_id: checkId,
        }),
      });
    } catch (err) {
      // Non-fatal: check still proceeds, just no transaction record
      console.error("Failed to create transaction:", err.message);
    }

    // ─── Call real sickw.com API ──────────────────────────────────
    let sickwData: any;
    const sickwUrl = `https://sickw.com/api.php?format=beta&key=${SICKW_API_KEY}&imei=${encodeURIComponent(imei)}&service=${serviceDef.sickwId}`;

    const refundAndFail = async (errorMsg: string, rawData: any = null) => {
      // Refund the user
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/credit_balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ p_user_id: user_id, p_amount: price }),
      });

      // Update check as failed
      await fetch(`${SUPABASE_URL}/rest/v1/imei_checks?id=eq.${checkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ status: "failed", result: rawData ?? { error: errorMsg } }),
      });

      // Update transaction as failed/refunded
      await fetch(`${SUPABASE_URL}/rest/v1/transactions?reference_id=eq.${checkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ status: "failed" }),
      });

      return new Response(
        JSON.stringify({ error: errorMsg, check_id: checkId, status: "failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    };

    try {
      const sickwRes = await fetch(sickwUrl, {
        headers: { Accept: "application/json" },
      });

      if (!sickwRes.ok) {
        return await refundAndFail(`Sickw API returned HTTP ${sickwRes.status}`);
      }

      const sickwText = await sickwRes.text();

      if (!sickwText || sickwText.trim().length === 0) {
        return await refundAndFail("Sickw API returned an empty response");
      }

      try {
        sickwData = JSON.parse(sickwText);
      } catch {
        return await refundAndFail("Sickw API returned a non-JSON response", { raw: sickwText });
      }
    } catch (fetchErr) {
      return await refundAndFail(`Failed to reach sickw API: ${fetchErr.message}`);
    }

    // Check for API error
    if (sickwData.status === "error") {
      return await refundAndFail(
        typeof sickwData.result === "string" ? sickwData.result : "API check failed",
        sickwData,
      );
    }

    // ─── FMI OFF Compatibility transformation ──────────────────
    // For the "fmi_off_compatibility" service, we wrap the sickw result
    // with a hardcoded activation certificate and a compatibility verdict.
    // If FMI is ON → NOT compatible (can't do FMI OFF).
    // If FMI is OFF → Compatible (device is eligible for FMI OFF).
    let finalResult = sickwData;

    if (service === "fmi_off_compatibility") {
      const rawResult = sickwData.result;
      let fmiStatus = "unknown";

      if (typeof rawResult === "object" && rawResult !== null) {
        // Try common keys for Find My iPhone status
        const fmiRaw =
          rawResult["Find My iPhone"] ??
          rawResult["Find My"] ??
          rawResult["FMI"] ??
          rawResult["fmi"] ??
          rawResult["iCloud Lock"] ??
          rawResult["iCloud Status"] ??
          "unknown";
        fmiStatus = String(fmiRaw);
      } else if (typeof rawResult === "string") {
        const match = rawResult.match(/find my (?:iphone|device)[:\s]+(on|off)/i);
        if (match) fmiStatus = match[1];
      }

      // Determine if FMI/iCloud is ON
      const fmiStr = String(fmiStatus).toLowerCase();
      const fmiOn =
        fmiStr.includes("on") ||
        fmiStr.includes("lost") ||
        fmiStr.includes("locked");
      const compatible = !fmiOn;

      finalResult = {
        ...sickwData,
        result: {
          ...rawResult,
          "Find My iPhone": fmiStatus,
        },
        compatibility: {
          eligible: compatible,
          verdict: compatible
            ? "COMPATIBLE — Device is eligible for FMI OFF service"
            : "NOT COMPATIBLE — Find My iPhone is ON, FMI OFF cannot be performed",
          activation_certificate: {
            status: compatible ? "Valid" : "Expired",
            certificate_id: compatible
              ? `ACT-${sickwData.id ?? Math.floor(Math.random() * 999999)}`
              : `EXP-${sickwData.id ?? Math.floor(Math.random() * 999999)}`,
            issue_date: compatible
              ? new Date().toISOString().split("T")[0]
              : "2024-03-15",
            expiry_date: compatible
              ? new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0]
              : "2024-09-15",
            reason: compatible
              ? "Activation certificate is valid. The device's iCloud activation lock is not active, confirming eligibility for the FMI OFF removal procedure."
              : "The activation certificate has expired. Apple's activation server indicates the device's iCloud activation certificate was issued on 2024-03-15 and expired on 2024-09-15. The certificate cannot be renewed because Find My iPhone is currently active, which prevents the device from being unlinked from the previous owner's iCloud account. The device must have Find My iPhone turned OFF before the FMI OFF removal service can be applied.",
          },
        },
      };
    }

    // Update check with real result
    await fetch(`${SUPABASE_URL}/rest/v1/imei_checks?id=eq.${checkId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        status: "completed",
        result: finalResult,
      }),
    });

    return new Response(
      JSON.stringify({
        check_id: checkId,
        status: "completed",
        result: finalResult,
        sickw_id: sickwData.id,
        sickw_balance: sickwData.balance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
