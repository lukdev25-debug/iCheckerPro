import React from 'react';

type Props = {
  amount?: number; // amount in main currency units, e.g., 10.5
  currency?: string;
};

export default function WalletButtons({ amount = 10.0, currency = 'USD' }: Props) {
  const handleBinancePay = async () => {
    try {
      const orderId = `order-${Date.now()}`;
      const resp = await fetch('/.netlify/functions/binance-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, orderId, description: 'Pago iCheckerPro' })
      });

      const json = await resp.json();
      if (!resp.ok) {
        console.error('Binance create-order error', json);
        alert('Error iniciando Binance Pay: ' + (json?.message || resp.statusText));
        return;
      }

      // La respuesta puede contener checkoutUrl o qrCodeUrl según la implementación
      const checkoutUrl = json?.data?.checkoutUrl || json?.data?.qrCodeUrl || json?.checkoutUrl;
      if (checkoutUrl) {
        // Abrir en nueva ventana para el checkout
        window.open(checkoutUrl, '_blank');
      } else if (json?.data?.paymentId) {
        alert('Orden creada, verifica el pago en el servidor. PaymentId: ' + json.data.paymentId);
      } else {
        alert('Orden creada, revisa la consola para más detalles.');
        console.log('Binance response', json);
      }
    } catch (err) {
      console.error(err);
      alert('Error al comunicarse con el servidor de pagos.');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {/* Preservamos el botón de MercadoPago existente si lo hay */}
      <button id="mercadopago-btn">Pagar con MercadoPago</button>

      {/* Nuevo botón Binance */}
      <button onClick={handleBinancePay}>Pagar con Binance</button>
    </div>
  );
}
