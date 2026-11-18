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
  assert.match(jsx, /const VIEW_WIDTH = DRAWING\.right - DRAWING\.left \+ \(2 \* G\.radius\) \/ 3;/);
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
});
