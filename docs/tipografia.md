# Escala tipográfica: única fuente de verdad

Los tamaños se centralizan en `src/app/globals.css`, con exactamente
siete tokens: `--type-h1-size`, `--type-h2-size`, `--type-h3-size`,
`--type-h4-size`, `--type-h5-size`, `--type-body-size` y `--type-meta-size`.

| Categoría | Móvil 390×844 | Tablet 768×1024 | Desktop 1440×900 | Grande 1920×1080 |
|---|---:|---:|---:|---:|
| H1 | 76px | 100px | 160px | 184px |
| H2 | 60px | 84px | 136px | 156px |
| H3 | 40px | 40px | 48px | 48px |
| H4 | 32px | 32px | 40px | 40px |
| H5 | 24px | 24px | 32px | 32px |
| Body | 16px | 24px | 32px | 36px |
| Meta | 14px | 16px | 20px | 24px |

H1, H2, Body y Meta usan fórmulas fluidas, no tamaños específicos por
dispositivo. La tabla representa resultados de referencia para esas resoluciones.
H1 conserva el límite por altura basado en la retícula del hero; H2 y Body
interpolan por tramos sin discontinuidad alrededor de 1440px. Los resultados
se redondean a múltiplos de 4 u 8px, salvo el ajuste óptico de 2px de Meta
en móvil. H3-H5 conservan sus tamaños previos.

En `:root` aparecen las bases y en los media queries globales sus variantes
responsive. Cada componente referencia directamente el token, sin tamaños
intermedios ni multiplicaciones; cambiar un token modifica todos sus usos.

El texto principal usa `--type-ink: var(--brand-white)` (`#FEFEFE`).
El texto meta usa `--type-meta-ink: var(--brand-gray-5)`, un paso más gris
que el anterior `--brand-gray-6`. Ambos tonos derivan exclusivamente de la paleta.

Google Sans se reserva a títulos y Manrope al cuerpo y metadatos.

### Pruebas de regresión

- `npm run test:typography`: bloquea font-size literales, cálculos locales,
  aliases, variantes adicionales, colores tipográficos independientes,
  redefiniciones de tokens y valores JSX/SVG fuera del sistema.
- `npm run test:typography:red`: introduce infracciones en fixtures aislados
  y comprueba que cada una falle con código 1; sin modificar producción.
- `npm run test:typography:propagation`: comprueba en Chromium cuatro
  tamaños de viewport, ambos temas y el efecto de cambiar cada token.

Las pruebas de Chromium verifican además los 16 tamaños objetivo de la tabla,
en ambos temas, así como la propagación individual de cada token.

CI ejecuta estas tres validaciones antes de generar el sitio.
