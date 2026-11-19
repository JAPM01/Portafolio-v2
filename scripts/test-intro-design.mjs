import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => readFileSync(new URL("../" + p, import.meta.url), "utf8");
test("El Venn mantiene tres columnas y conserva las etiquetas Meta a tamaño CSS real", () => {
  const jsx=read("src/components/VennFlow.tsx");
  const css=read("src/components/venn-flow.module.css");
  const intro=read("src/components/intro.module.css");
  assert.match(jsx, /className={`type-meta \$\{styles\.circleLabel\}`}/);
  assert.match(css, /\.circleLabel\s*\{[^}]*position:\s*absolute;/);
  assert.doesNotMatch(jsx, /<text\s+className={styles\.circleLabel}/);
  assert.match(jsx, /const VIEW_WIDTH = DRAWING\.right - DRAWING\.left \+ 24;/);
  assert.match(intro, /\.diagram\s*\{\s*grid-column:\s*6 \/ 9;/);
  assert.match(intro, /align-self:\s*first baseline/);
  // Más aire título-contenido (64px): el Venn va arriba de la fila
  // para que la distancia título-Venn siga dentro de los 100px.
  assert.match(intro, /row-gap:\s*var\(--space-16\)/);
  assert.match(intro, /padding-block:\s*var\(--space-3\)/);
  assert.match(intro, /border-block-start:\s*var\(--border-width\) solid var\(--border-default\)/);
  assert.match(intro, /color:\s*var\(--type-body-ink\)/);
  assert.match(jsx, /import HeroBackground from "\.\/HeroBackground"/);
  // El Venn usa el shader compartido del Hero (con o sin props de
  // configuración: follow/zoom/center no crean un segundo shader).
  assert.match(jsx, /<HeroBackground[\s\/>]/);
  assert.match(jsx, /clipPath:\s*circleClip\(G\.usability\)/);
  assert.match(css, /stroke:\s*var\(--brand-white\)/);
  assert.match(css, /stroke-width:\s*calc\(var\(--border-width\) \* 2\)/);
  assert.doesNotMatch(jsx, /<radialGradient/);
  assert.match(intro, /row-gap:\s*var\(--space-6\)/);
  assert.doesNotMatch(intro, /inline-size:\s*116%/);
  assert.match(jsx, /const MESH_ARTWORK = tripleIntersectionBounds\(\)/);
  assert.match(jsx, /<HeroBackground follow=\{0\} zoom=\{0\.2\} center=\{\[0\.6, 0\.5\]\} referenceSpace="viewport"\s*\/>/);
  // Muse: cada círculo mantiene su marca, el mismo orden y ciclo de 18s.
  assert.match(jsx, /"var\(--brand-orange\)"[\s\S]*"var\(--brand-blue\)"[\s\S]*"var\(--brand-cyan\)"/);
  assert.match(jsx, /P\.on\.forEach/);
  assert.match(jsx, /style={{ stroke: LIT_COLORS\[i\] }}/);
  assert.match(read("src/app/globals.css"), /--motion-diagram-cycle:\s*18s/);
  const section = read("src/components/Intro.tsx");
  assert.doesNotMatch(section, /SOBRE MI MÉTODO|ABOUT MY METHOD|t\.eyebrow/);
  assert.match(intro, /\.headingBlock\s*\{[^}]*text-align:\s*center/);
  // El anillo interno es una línea de construcción fina y sutil
  // (trazo hairline aún más fino, guionado MUY LARGO 16/4, opacidad
  // baja), va debajo del mesh y NUNCA se pinta: solo el círculo
  // sólido exterior.
  assert.match(css, /\.innerRing\s*\{[^}]*r:\s*calc\(var\(--venn-ring-radius\) - var\(--space-2\)\)/);
  assert.match(css, /stroke-dasharray:\s*16 4/);
  assert.match(css, /stroke-width:\s*calc\(var\(--border-width\) \/ 4\)/);
  assert.match(jsx, /className=\{styles\.innerRing\}/);
  assert.doesNotMatch(jsx, /innerLitRing|accentLitArc/);
  assert.doesNotMatch(css, /\.innerLitRing|\.accentLitArc/);
  assert.match(css, /\.svgDashed\s*\{[^}]*z-index:\s*0/);
  assert.match(jsx, /className=\{styles\.svgDashed\}/);
  assert.match(jsx, /const ARC_ORIENTATIONS = \[225, 315, 90\] as const/);
  assert.match(jsx, /const ARC_DIVISIONS = 8/);
  // Los chips son paths de arco explícitos de 45° (no dasharray),
  // para que midan lo mismo y estén centrados a cualquier escala.
  assert.match(jsx, /function arcPath\(cx: number, cy: number, r: number, centerDeg: number, spanDeg: number\)/);
  assert.match(jsx, /d=\{arcPath\(center\.x, center\.y, G\.radius, ARC_ORIENTATIONS\[i\], ARC_SPAN\)\}/);
  assert.doesNotMatch(jsx, /accentArc\(/);
  // El chip de 45° es FIJO (siempre visible) y la animación enciende
  // TODO el círculo sólido exterior, no el punteado.
  assert.match(css, /\.accentArc\s*\{[^}]*filter:\s*drop-shadow/);
  assert.match(css, /\.litCircle\s*\{/);
  assert.match(jsx, /className=\{styles\.accentArc\}/);
  assert.match(jsx, /className=\{styles\.litCircle\}/);
  assert.match(jsx, /lit\[i\]!\.setAttribute\("opacity", String\(v\)\)/);
  // El pulso, el mesh y las ventanas de encendido originales permanecen.
  assert.match(jsx, /hold:\s*\[0\.65, 0\.93\]/);
  assert.match(jsx, /<HeroBackground follow=\{0\} zoom=\{0\.2\} center=\{\[0\.6, 0\.5\]\} referenceSpace="viewport"/);
});
