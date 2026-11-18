# Paleta de marca — cinco colores base, una fuente de verdad

**Única fuente editable:** `src/app/globals.css`, dentro de `:root`.

| Color | Token raíz |
|---|---|
| Azul eléctrico | `--brand-blue` |
| Naranja | `--brand-orange` |
| Cian | `--brand-cyan` |
| Negro (`#010101`) | `--brand-black` |
| Blanco (`#FEFEFE`) | `--brand-white` |

Los tonos derivados (`--brand-blue-1..7`, `--brand-orange-1..3`,
`--brand-orange-dark`, `--brand-cyan-1..3`, `--brand-cyan-dark` y
`--brand-gray-1..7`) se calculan automáticamente con `color-mix()`.
El negro y el blanco son los extremos de la escala neutra.

## Consumo de tokens

- CSS: solo tokens de marca o semánticos, nunca nuevos hexadecimales.
- Tema claro/oscuro: `--surface-*`, `--text-*`, `--border-*` y
  `--neutral-*` se resuelven por cascada desde la misma paleta.
- SVG: colores `var(--brand-*)`; `currentColor` para herencia.
- Canvas/WebGL: `src/lib/brand-palette.ts` lee las cinco bases
  mediante `getComputedStyle()` y deriva el brillo blanco-cian
  sin declarar una sexta muestra. El hero usa el negro del brand.

Al cambiar un color base y recargar la aplicación, todos los
componentes dependientes y los shaders toman el color actualizado.

## Regla obligatoria de CI

- `npm run test:colors` inspecciona CSS, TS/JS, shaders y SVG
  de producción, bloqueando cualquier otro color fijo.
- `npm run test:colors:red` comprueba tanto una validación verde
  como el fallo rojo (salida 1) producido por un fixture temporal.
- El workflow de despliegue ejecuta ambas pruebas antes de `next build`.

Las fotografías y capturas de proyectos no se recolorean:
son recursos ajenos a la identidad cromática de la interfaz.
