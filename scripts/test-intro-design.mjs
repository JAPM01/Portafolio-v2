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
  assert.match(intro, /row-gap:\s*var\(--space-8\)/);
  assert.match(intro, /padding-block:\s*var\(--space-3\)/);
  assert.match(intro, /border-block-start:\s*var\(--border-width\) solid var\(--neutral-4\)/);
});
