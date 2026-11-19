import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const globals = read("src/app/globals.css");

test("Una sola retícula estructural en todas las secciones", () => {
  // Home (19 Nov 2026): solo Hero + Intro; las demás secciones están en
  // src/components/_backup-placeholder/ y nada las importa. La versión
  // experimento vive en src/components/experimento/.
  for (const name of [
    "Hero", "Intro", "ContactClose", "WorkDetail",
    "experimento/ExpWork", "experimento/ExpExperience",
    "experimento/ExpClients", "experimento/ExpTestimonials",
    "experimento/ExpCv", "experimento/ExpClose",
    "experimento/ExpHero", "experimento/ExpManifesto",
    // ExpPreloader y ExpGridLines son overlays (velo + líneas de fondo),
    // no secciones: no usan la retícula.
  ]) {
    assert.match(read("src/components/" + name + ".tsx"), /\bsite-grid\b/,
      name + ": falta la retícula compartida");
  }
  assert.match(read("src/app/privacy/page.tsx"), /\bsite-grid\b/);
  for (const name of [
    "intro", "work-detail", "contact-close",
    "experimento/exp-work", "experimento/exp-experience",
    "experimento/exp-clients", "experimento/exp-testimonials",
    "experimento/exp-cv", "experimento/exp-close",
    "experimento/exp-hero", "experimento/exp-manifesto",
    "experimento/exp-header",
    "experimento/exp-preloader", "experimento/exp-grid-lines",
  ]) {
    assert.doesNotMatch(read("src/components/" + name + ".module.css"),
      /grid-template-columns:\s*minmax\(0,\s*39fr\)/,
      name + ": persiste una división independiente 39/61");
  }
  assert.match(globals, /--page-margin:\s*var\(--grid-gutter\)/);
  assert.match(globals,
    /grid-template-columns:\s*repeat\(var\(--grid-columns\),\s*minmax\(0,\s*1fr\)\)/);
});

test("Columnas, gutters y márgenes coinciden a todos los anchos", () => {
  const chrome = process.env.CHROME_BIN || "google-chrome";
  assert.equal(spawnSync(chrome, ["--version"], { encoding: "utf8" }).status, 0,
    "Chromium necesario para medir la retícula");
  const dir = mkdtempSync(join(tmpdir(), "site-grid-"));
  try {
    const css = JSON.stringify(globals.replace(/@import[^\n]*\n/g, ""));
    const fixture = [
      '<!doctype html><html><head><meta charset="utf-8"></head><body>',
      '<pre id="result"></pre><script>',
      '(async()=>{const css=__CSS__,results=[];',
      'for(const width of [390,768,1024,1440,1920]){',
      'const frame=document.createElement("iframe");',
      'frame.style.width=width+"px";frame.style.height="400px";',
      'frame.style.border="0";document.body.append(frame);',
      'frame.srcdoc="<html><head><style>"+css+"</style></head><body>"+',
      '"<div class=\\"container site-grid\\" id=\\"base\\"><div></div></div>"+',
      '"<div class=\\"container-indent site-grid\\" id=\\"inset\\"><div></div></div>"+',
      '"</body></html>";',
      'await new Promise(resolve=>frame.onload=resolve);',
      'const doc=frame.contentDocument;',
      'const measure=id=>{const el=doc.getElementById(id);',
      'const s=doc.defaultView.getComputedStyle(el);',
      'const child=el.firstElementChild.getBoundingClientRect();',
      'return {tracks:s.gridTemplateColumns.split(" ").map(parseFloat),',
      'count:s.gridTemplateColumns.split(" ").length,',
      'gap:parseFloat(s.columnGap),padding:parseFloat(s.paddingLeft),left:child.left};};',
      'results.push({width,base:measure("base"),inset:measure("inset")});',
      'frame.remove();}',
      'document.getElementById("result").textContent=JSON.stringify(results);',
      '})().catch(e=>document.getElementById("result").textContent=JSON.stringify({error:String(e)}));',
      '</script></body></html>',
    ].join("\n").replace("__CSS__", css);
    const file = join(dir, "site-grid.html");
    writeFileSync(file, fixture);
    const res = spawnSync(chrome, [
      "--headless=new", "--no-sandbox", "--disable-gpu",
      "--disable-dev-shm-usage", "--virtual-time-budget=8000",
      "--dump-dom", "file://" + file,
    ], { encoding: "utf8", timeout: 40000, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(res.status, 0, res.stderr?.slice(-1200));
    const match = res.stdout.match(/<pre id="result">([^<]+)<\/pre>/);
    assert.ok(match, "Sin medidas: " + res.stdout.slice(-450));
    const data = JSON.parse(match[1].replaceAll("&amp;", "&"));
    assert.ok(Array.isArray(data), JSON.stringify(data));
    for (const row of data) {
      const wide = row.width >= 1024;
      const gap = wide ? 24 : 16;
      const cols = wide ? 12 : 4;
      assert.equal(row.base.count, cols, row.width + ": columnas principales");
      assert.equal(row.inset.count, wide ? 10 : 4, row.width + ": columnas centrales");
      assert.equal(row.base.gap, gap, row.width + ": gutter principal");
      assert.equal(row.inset.gap, gap, row.width + ": gutter interior");
      assert.ok(Math.abs(row.base.padding - gap) < 1, row.width + ": margen global");
      assert.ok(Math.abs(row.base.left - gap) < 1, row.width + ": primer track");
      const track = (row.width - 2 * gap - (cols - 1) * gap) / cols;
      const indent = wide ? gap + track + gap : gap;
      assert.ok(Math.abs(row.inset.padding - indent) < 1,
        row.width + ": sangría alineada con la segunda columna");
      assert.ok(Math.abs(row.inset.left - indent) < 1,
        row.width + ": pista interior desplazada");
      for (const size of row.base.tracks) {
        assert.ok(Math.abs(size - track) < 1,
          row.width + ": ancho de pista principal");
      }
      for (const size of row.inset.tracks) {
        assert.ok(Math.abs(size - track) < 1,
          row.width + ": las columnas centrales deben coincidir");
      }
      console.log("SITE_GRID_PASSED", row.width, cols, "columnas", gap, "px gutter");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
