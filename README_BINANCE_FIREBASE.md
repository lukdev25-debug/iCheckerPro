# iCheckerPro - Integración Binance Pay, Firebase Auth (Google) y Netlify

Esta rama (feature/binance-firebase-login) agrega el código necesario para:
- Añadir un botón "Pagar con Binance" en la wallet (componente React).
- Funciones Netlify (serverless) para crear órdenes en Binance Pay y recibir webhooks.
- Integración básica con Firebase Authentication (Google sign-in) usando SDK modular v9.
- netlify.toml y guía de despliegue.

IMPORTANTE: No incluyo claves ni secretos en el repositorio. Debes configurar variables de entorno en Netlify (o en tu entorno local) antes de probar.

Variables de entorno necesarias (Netlify environment variables)
- REACT_APP_FIREBASE_API_KEY
- REACT_APP_FIREBASE_AUTH_DOMAIN
- REACT_APP_FIREBASE_PROJECT_ID
- REACT_APP_FIREBASE_APP_ID
- BINANCE_API_KEY
- BINANCE_API_SECRET
- BINANCE_MERCHANT_ID
- (opcional) BINANCE_API_URL (por defecto https://bpay.binanceapi.com)

Pasos para poner en marcha localmente
1) Instala dependencias
   npm install
   npm install firebase

2) Ejecuta la app (React)
   npm run start

3) Ejecuta funciones Netlify localmente (opcional)
   npm i -g netlify-cli
   netlify dev

4) Configura Firebase
   - Crea un proyecto en https://console.firebase.google.com
   - Habilita Authentication > Sign-in method > Google
   - Agrega dominios autorizados: localhost:3000 y tu dominio Netlify (por ejemplo: mysite.netlify.app)
   - Copia las credenciales del SDK web (apiKey, authDomain, projectId, appId) y ponlas en las variables de entorno REACT_APP_...

5) Configura Binance Pay
   - Crea/usa cuenta de comerciante en Binance Pay
   - Obtén BINANCE_API_KEY, BINANCE_API_SECRET y BINANCE_MERCHANT_ID
   - Configura la URL pública para webhooks: https://<tu-sitio>.netlify.app/.netlify/functions/binance-webhook
   - Añade esas variables a Netlify Environment

6) Despliegue en Netlify
   - Crear un sitio en Netlify conectado a este repositorio/branch
   - Añadir las variables de entorno listadas arriba
   - Deploy automático: Netlify ejecutará `npm run build` y publicará la carpeta `build`

Notas sobre el watermark "made in bolt"
- No realicé cambios automáticos para borrar una marca de agua ya que no encontré su ubicación en el código durante la implementación inicial.
- Para quitar la marca, busca en el repo las cadenas "made in bolt" o "bolt.new" y elimina la sección HTML o el script que la inyecta. Si la marca la impone el servicio bolt.new (por ser una versión gratuita), puede ser necesario actualizar el plan del servicio.

Siguientes pasos
- Revisa los archivos añadidos en esta rama y realiza pruebas locales.
- Cuando configures las variables de entorno en Netlify, yo puedo ejecutar pruebas de creación de órdenes y verificar el flujo (necesitaré que me confirmes cuando las variables estén configuradas — no pongas claves en el PR).
- Si quieres que yo complete la verificación, añade un comentario aquí cuando hayas configurado variables en Netlify y listo el dominio para webhooks.

Si necesitas que haga cambios en la UX (mostrar QR en vez de abrir ventana, integrar con tu sistema de órdenes), dime cómo quieres que se comporte y lo ajusto.
