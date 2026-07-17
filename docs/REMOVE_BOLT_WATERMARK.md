Guía para localizar y quitar la marca de agua "made in bolt"

Si en tu sitio aparece la marca de agua "made in bolt" o similar, sigue estos pasos para localizarla y eliminarla:

1) Buscar en el código fuente
  - Desde la raíz del repo ejecuta:
    grep -Rin "made in bolt" . || true
    grep -Rin "bolt.new" . || true
  - Busca también en public/index.html y en componentes de footer: src/components/Footer*.tsx|.tsx|.jsx

2) Si está en HTML o JSX
  - Abre el archivo y elimina la etiqueta que contiene el texto o el enlace.

3) Si se inyecta por un script externo
  - Busca inclusiones de scripts externos que apunten a bolt.new o dominios relacionados y elimina la línea <script src="..."> o condiciona su carga.

4) Si la marca la impone el servicio (no está en tu código)
  - Revisa la cuenta/servicio que generó el HTML (p. ej. constructor externo) — algunas herramientas agregan watermark en el plan gratuito.
  - Considera actualizar el plan o exportar el HTML y alojarlo directamente.

Si quieres, puedo encargarte esta búsqueda y abrir un PR para eliminarlo si me confirmas que me dé acceso a todos los archivos (ya tengo una rama creada).