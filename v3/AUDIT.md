# Auditoría v3 — spec por spec (20 Nov 2026, 09:45 CST)

Veredicto: la estructura está (layout, secciones, tokens base, métricas, marquee, cortina), pero lo que hace que el sitio SEA ese sitio — cromo líquido, vidrio real, cursor magnético, JP vector, media real — no está. 13 cumplen, 9 parciales, 8 fallan. Nada tocado del sitio.

## Globales / Stack
- ✅ React + TS + Tailwind 4 (Next 16.4.6, React 19)
- ✅ Lenis (lerp 0.1) + GSAP ScrollTrigger cableados y usados
- ✅ Three.js / R3F / drei
- ⚠️ Tokens: #010101 ✅, #0a0a0a ✅, #121212 definido pero NUNCA usado; #FEFEFE ✅
- ❌ Azul/ámbar "nunca como texto legible": "LIVE 2026" está en ámbar #FF9636 como texto (Work.tsx:70)
- ⚠️ Tipografía: Inter Tight + tracking-tighter + IBM Plex Mono en código, pero Google Fonts se bloquea en el sandbox y las capturas usan sans genérica

## Header
- ✅ Grid 3 col, backdrop-blur-md, border-white/10; badge AVAILABLE 2027 con pulso; disciplinas; coords + reloj UTC/PCH
- ❌ Monograma JP NO es vector: es un div con texto "JP", sin SVG
- ❌ CTA magnético: botón normal con hover; no hay código magnético en todo el proyecto

## Hero
- ⚠️ Cromo líquido: existe el shader (fbm + lerp 0.06), pero visualmente es lavado azul + humo plateado, no cromo. La referencia es cortina de cromo vertical con estrías y brillo cian
- ❌ Fluted glass: solo overlay CSS de rayas + blur 1px; sin refracción real (no hay feDisplacementMap ni shader de desplazamiento); en captura las estrías apenas se ven
- ⚠️ Titular: grande, tracking cerrado, blanco ✅, pero NO hay mix-blend-mode: difference (grep: nada) y el hero es tarjeta inset con márgenes, no a sangre
- ⚠️ Reactividad al puntero: en código sí (pointermove + lerp), pero NO se pudo verificar en vivo — el navegador del sandbox se cayó dos veces en la prueba

## Selected Work
- ❌ Sticky top 0 + 100vh por tarjeta: las tarjetas son sticky top 86/96px, altura min(78vh, 640px)
- ⚠️ Cortina GSAP: el mecanismo SÍ funciona (captura v3-a-curtain.png: la 01 se desenfoca y la 02 la cubre), pero el blur se ve más fuerte que "sutil" y la escala 0.95 no quedó confirmada numéricamente
- ❌ Media: arte de gradiente placeholder, sin foto ni video a sangre
- ❌ Cursor magnético VIEW CASE: no existe cursor personalizado en todo el proyecto; "Abrir caso" es botón estático

## Manifiesto / Venn
- ✅ Bloque editorial con keywords; 3 esferas (Product / Design / Code) + etiquetas
- ❌ Vidrio real: transmission 0.95 / ior 1.5 / roughness ~0 SÍ están en código, pero NO hay aberración cromática y el Canvas del Venn NO tiene <Environment> — sin mapa de entorno la transmisión no refracta nada, por eso las esferas se ven sólidas/opacas en vez de vidrio translúcido. Gap técnico principal del Venn
- ❌ Rotación orbital por scroll: solo cambia con wheel sobre el propio Venn o con el puntero; el scroll de la página no la mueve (sin ScrollTrigger ligado al Venn)

## Experiencia / Clientes
- ✅ Sin cajas, desde línea divisoria; métricas 11+ / 50+ / 200k+ verticales con labels #888; párrafo de síntesis; 10 logos mono opacidad 0.4, hover blanco + glow

## Footer
- ⚠️ JP 3D: funciona y ya se lee "JP", pero es un extruido de bloques; la referencia es cromo redondeado con reflejos fuertes
- ⚠️ Atmósfera radial ámbar + halo azul: está en código, pero en captura el ámbar apenas se percibe
- ⚠️ Contactos: están (Email, LinkedIn, X, Telegram + GitHub extra), pero en grid de 4 columnas, no claramente asimétrico
- ⚠️ Marquee infinito: existe en DOM (22s linear infinite), nunca verificado en captura

## Incidentes de la auditoría
- La VM se reemplazó a mitad de la prueba: murió el servidor local y se borró /tmp; se reinició el servidor (http://127.0.0.1:8310/ de nuevo arriba) y se reinstaló playwright-core
- La sonda de puntero/cortina se cayó dos veces por crash del Chromium del sandbox (SwiftShader + 3 canvas); la cortina quedó verificada por captura, el puntero quedó solo verificado en código
