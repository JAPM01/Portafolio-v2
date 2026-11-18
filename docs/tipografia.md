# Escala tipográfica: única fuente de verdad

Los tamaños existentes se centralizan en `src/app/globals.css`, con exactamente
siete tokens: `--type-h1-size`, `--type-h2-size`, `--type-h3-size`,
`--type-h4-size`, `--type-h5-size`, `--type-body-size` y `--type-meta-size`.

| Categoría | Mobile (<1024px) | Desktop (>=1024px) |
|---|---|---|
| H1 | fórmula fluida del hero, con límite por altura | fórmula fluida del hero, con límite por altura |
| H2 | 48px | 64px |
| H3 | 40px | 48px |
| H4 | 32px | 40px |
| H5 | 24px | 32px |
| Body | 20px | 28px |
| Meta | 16px | 20px |

En `:root` aparecen las bases y en los media queries globales sus variantes
responsive. Cada componente referencia directamente el token, sin tamaños
intermedios ni multiplicaciones; cambiar un token modifica todos sus usos.

El texto principal usa `--type-ink: var(--brand-white)` (`#FEFEFE`).
El texto meta usa `--type-meta-ink: var(--brand-gray-6)`, el segundo
paso de gris desde el blanco. Ambos derivan exclusivamente de la paleta.

Google Sans se reserva a títulos y Manrope al cuerpo y metadatos.

### Pruebas de regresión

- `npm run test:typography`: bloquea font-size literales, cálculos locales,
  aliases, variantes adicionales, colores tipográficos independientes,
  redefiniciones de tokens y valores JSX/SVG fuera del sistema.
- `npm run test:typography:red`: introduce infracciones en fixtures aislados
  y comprueba que cada una falle con código 1; sin modificar producción.
- `npm run test:typography:propagation`: comprueba en Chromium cuatro
  tamaños de viewport, ambos temas y el efecto de cambiar cada token.

CI ejecuta estas tres validaciones antes de generar el sitio.
