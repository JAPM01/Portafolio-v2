# Paleta de interfaz — 17 colores

Los únicos colores base de la interfaz son 7 azules, 3 naranjas y
7 grises neutros. La referencia visual es la paleta Sentos compartida;
no disponemos del archivo de origen.

## Bases verificadas de la referencia

- Azul original: `#000AFF` — no modificar.
- Naranja original: `#FF9636` — no modificar.
- Neutros acromáticos: croma OKLCH = 0.

## Escalas calculadas en OKLCH

| Familia | Tonos (de base a claro) |
|---|---|
| Azul | `#000AFF`, `#353FF3`, `#5C65F3`, `#878AF8`, `#ACB0F6`, `#D3D6FA`, `#ECEEFF` |
| Naranja | `#FF9636`, `#FDAE71`, `#FFC69B` |
| Gris | `#070707`, `#303030`, `#585858`, `#808080`, `#A4A4A4`, `#CECECE`, `#EBEBEB` |

Las muestras secundarias **son calculadas, no copiadas de píxeles**.
Los tonos azules avanzan por `(L,C,h)`: (0.500,0.260,270°),
(0.580,0.210,275°), (0.680,0.160,280°), (0.780,0.100,281°),
(0.885,0.050,281°), (0.952,0.024,282°).
Los naranjas secundarios: (0.815,0.120,58°) y (0.867,0.098,58°).
Los neutros emplean `L = 0.13, 0.31, 0.46, 0.60, 0.72, 0.85, 0.94`,
con `C = 0`. Se limita croma al gamut sRGB cuando sea necesario.

## Implementación

- **CSS:** `src/app/globals.css` define `--brand-blue-1..7`,
  `--brand-orange-1..3` y `--brand-gray-1..7`. Los tokens
  semánticos `--primary-*`, `--neutral-*`, `--success-*`,
  `--warning-*` y `--danger-*` remiten solo a esas 17 muestras.
- **React, Canvas y WebGL:** `src/lib/brand-palette.ts` exporta los
  mismos HEX, incluidos los colores del mesh. Mantener ambas fuentes
  sincronizadas cuando se apruebe una actualización de paleta.
- **Temas:** claro y oscuro reutilizan las 17 muestras; no se crean
  escalas nuevas de rojo, verde o amarillo.
- **Transparencias:** pueden combinar las muestras con alpha. La
  renderización mezcla colores de forma natural; no constituyen nuevos
  colores base.
- **Excepciones:** capturas, fotografías y marcas de proyectos ajenos
  al diseño de la interfaz, así como los canales matemáticos de filtros
  ópticos SVG/WebGL, conservan sus datos.
