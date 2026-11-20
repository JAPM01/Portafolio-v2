# Portafolio v3

Portfolio 1:1 a la imagen y al brief técnico (jprat.studio como referencia visual), con todo el copy en Lorem Ipsum.

- Next.js 16 + React 19 + TypeScript + Tailwind 4, Lenis + GSAP ScrollTrigger, Three.js / React Three Fiber + drei, Lucide.
- Export estático (`output: "export"`).

## Preview deployment

Vive dentro del repo Portafolio-v2, en la carpeta `v3/`. El workflow de
GitHub Pages del repo lo construye y lo publica en
https://japm01.github.io/Portafolio-v2/v3/ junto con el resto del sitio.
La rama `preview` es la única que despliega.

## Desarrollo local

```bash
npm install
npm run build
npx serve out
```
