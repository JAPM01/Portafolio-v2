# Política de color: cinco bases, una fuente de verdad

Solo pueden editarse las cinco bases de `src/app/globals.css`:
azul (`--brand-blue`), naranja (`--brand-orange`), cian (`--brand-cyan`),
negro (`--brand-black`, actualmente `#010101`) y blanco
(`--brand-white`, actualmente `#FEFEFE`).

Los shades azul, naranja, cian y gris se derivan con `color-mix()`;
no tienen valores independientes. Los tokens de interfaz y temas
referencian esas escalas.

**Prohibido:** nuevos HEX o RGB/HSL fijos; colores nombrados;
colores `display-p3` escritos directamente; mezclar colores literales
dentro de gradientes; SVG externos dependientes de `currentColor`;
bases/shades duplicados, cíclicos o no derivados; overrides de la
paleta del shader WebGL.

**SVG y placeholders:** el componente `BrandMedia` representa
los placeholders como SVG inline; su CSS usa tokens semánticos.
Las imágenes originales de proyectos se mantienen intactas.
El `public/brand/mark.svg` puede emplearse como máscara alfa.

**Canvas / WebGL:** `brand-palette.ts` consulta CSS en el navegador.
El shader del hero no acepta una prop de colores independiente.
Excepción estricta: `gl.clearColor(0, 0, 0, 1)` dentro de
`FluidBackground.tsx` inicializa un framebuffer de simulación,
no introduce pigmentos nuevos. Los filtros ópticos RGB de
`JpmGlassOptics.tsx` separan canales de la imagen refractada:
no son fuentes adicionales de color.

**Pruebas obligatorias antes del build en CI:**

- `npm run test:colors`: auditoría de fuentes, SVG embebidos,
  SHADE graph, valores numéricos RGB y conexiones al mesh.
- `npm run test:colors:red`: fixtures temporales independientes;
  cada infracción debe fallar en rojo con salida 1 y mensaje.
- `npm run test:colors:propagation`: test de adaptador WebGL
  y navegador Chromium headless, variando temporalmente los cinco
  colores y verificando fondos, texto, shades y SVG inline
  en temas claro y oscuro.

Se rechazan las regresiones antes de generar o publicar el sitio.
