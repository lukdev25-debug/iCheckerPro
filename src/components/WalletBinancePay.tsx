import React, { useState } from 'react';

type CreateOrderResp = {
  success: boolean;
  orderId?: string;
  paymentCode?: string;
  binanceId?: string;
  qrUri?: string;
  message?: string;
};

export default function WalletBinancePay({ userId, amount }: { userId: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<CreateOrderResp | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  const createOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/binance-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'USDT', userId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setOrder(json);
      } else {
        alert('Error creando orden: ' + (json.message || JSON.stringify(json)));
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentOnce = async () => {
    if (!order?.paymentCode) return;
    setVerifyLoading(true);
    try {
      const res = await fetch('/.netlify/functions/binance-verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentCode: order.paymentCode, expectedAmount: String(amount) }),
      });
      const json = await res.json();
      setVerifyResult(json);
      if (json.found) {
        alert('Pago detectado ✅');
      } else {
        alert('Pago no encontrado aún. Intenta verificar de nuevo o espera unos minutos.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al verificar el pago');
    } finally {
      setVerifyLoading(false);
    }
  };

  const startPollingVerify = (intervalMs = 15000, maxAttempts = 8) => {
    if (!order?.paymentCode) return;
    setPolling(true);
    let attempts = 0;
    const id = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/.netlify/functions/binance-verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentCode: order.paymentCode, expectedAmount: String(amount) }),
        });
        const json = await res.json();
        setVerifyResult(json);
        if (json.found) {
          clearInterval(id);
          setPolling(false);
          alert('Pago detectado ✅');
        } else if (attempts >= maxAttempts) {
          clearInterval(id);
          setPolling(false);
          alert('No se detectó el pago tras varios intentos. Intenta verificar manualmente.');
        }
      } catch (err) {
        console.error('poll err', err);
      }
    }, intervalMs);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div>
      {!order ? (
        <div>
          <div>Monto: {amount} USDT</div>
          <button onClick={createOrder} disabled={loading} className="btn-primary mt-3">
            {loading ? 'Creando...' : 'Pagar con Binance (mostrar instrucciones)'}
          </button>
        </div>
      ) : (
        <div>
          <h4 className="mt-2">Instrucciones de pago</h4>
          <div className="mt-2">
            <strong>Binance ID / Wallet:</strong> {order.binanceId ?? 'TU_BINANCE_ID'}{' '}
            <button onClick={() => copyToClipboard(order.binanceId ?? '')} className="ml-2">
              Copiar ID
            </button>
          </div>
          <div className="mt-2">
            <strong>Payment code (nota):</strong> <code>{order.paymentCode}</code>{' '}
            <button onClick={() => copyToClipboard(order.paymentCode ?? '')} className="ml-2">
              Copiar
            </button>
          </div>
          <div className="mt-4">
            <strong>QR:</strong>
            <div className="mt-2">
              <img
                alt="QR pago"
                src={
                  order.qrUri ??
                  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    (order.binanceId ?? '') + '|' + (order.paymentCode ?? '')
                  )}`
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <button onClick={verifyPaymentOnce} disabled={verifyLoading} className="btn-primary mr-2">
              {verifyLoading ? 'Verificando...' : 'Verificar pago ahora'}
            </button>
            <button onClick={() => startPollingVerify()} disabled={polling} className="btn-secondary">
              {polling ? 'Verificando...' : 'Iniciar verificación automática'}
            </button>
          </div>

          {verifyResult && (
            <div className="mt-4">
              <pre className="text-xs">{JSON.stringify(verifyResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
