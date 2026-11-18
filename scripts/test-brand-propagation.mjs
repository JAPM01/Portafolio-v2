import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const adapter = readFileSync(new URL("../src/lib/brand-palette.ts", import.meta.url), "utf8");
const shader = readFileSync(new URL("../src/components/FlowGradientBackground.tsx", import.meta.url), "utf8");
const fluid = readFileSync(new URL("../src/components/FluidBackground.tsx", import.meta.url), "utf8");
const venn = readFileSync(new URL("../src/components/VennFlow.tsx", import.meta.url), "utf8");
const media = readFileSync(new URL("../src/components/BrandMedia.tsx", import.meta.url), "utf8");
const BASES = ["blue", "orange", "cyan", "black", "white"];

function baseValues() {
  const out = {};
  for (const name of BASES) {
    const match = css.match(new RegExp("--brand-" + name + ":\\s*(#[0-9a-fA-F]{6})\\s*;"));
    assert.ok(match, "Falta --brand-" + name);
    out[name] = match[1];
  }
  return out;
}

const original = baseValues();
const alternative = {
  blue: "#48B55C",
  orange: "#B62AFF",
  cyan: "#BD7331",
  black: "#242D3C",
  white: "#CEDCD6",
};

test("Cada uno de los cinco colores se propaga al adaptador real del shader", () => {
  const code = ts.transpileModule(adapter, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: "brand-palette.ts",
  }).outputText;
  const exports = {};
  let values = { ...original };
  const sandbox = {
    exports,
    document: { documentElement: {} },
    getComputedStyle: () => ({
      getPropertyValue: token => values[token.slice("--brand-".length)] ?? "",
    }),
  };
  runInNewContext(code, sandbox, { filename: "brand-palette.js" });
  const initial = [...exports.readMeshPalette()];

  for (const name of BASES) {
    values = { ...original, [name]: alternative[name] };
    assert.equal(exports.brandHex(name), alternative[name]);
    assert.equal(exports.readBrandPalette()[name], alternative[name]);
    const changed = exports.readMeshPalette();
    assert.notDeepEqual([...changed], initial, name + " no alteró el mesh");
    const index = ({ black: 0, blue: 1, cyan: 2, orange: 3, white: 4 })[name];
    assert.notEqual(changed[index], initial[index], name + " no alteró su entrada del shader");
    const channels = exports.brandRgb01(changed[index]);
    assert.equal(channels.length, 3);
    assert.ok(channels.every(x => x >= 0 && x <= 1));
  }

  assert.match(shader, /readMeshPalette\(\)/);
  assert.match(shader, /gl\.uniform3f\(loc,\s*\.\.\.brandRgb01\(brandColors\[i\]\)\)/);
  assert.doesNotMatch(shader, /\bcolors\s*\?\s*:/);
  assert.match(fluid, /readBrandPalette\(\)/);
  assert.match(venn, /var\(--brand-cyan\)/);
  assert.match(media, /var\(--surface-raised\)|BrandMedia|styles\.placeholder/);
  console.log("PROPAGACIÓN: cinco bases -> adaptador WebGL y consumidores comprobados");
});

test("Cada shade está conectado a su base; no hay rutas huérfanas", () => {
  const root = css.match(/:root\s*\{([\s\S]*?)^\}/m)?.[1] ?? "";
  const tokens = new Map([...root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value]));
  function origins(key, visited = []) {
    assert.ok(!visited.includes(key), "Dependencia circular: " + [...visited, key].join(" -> "));
    const value = tokens.get(key);
    assert.ok(value, "Sin definición: " + key);
    if (BASES.some(name => key === "--brand-" + name)) return new Set([key]);
    const result = new Set();
    for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      for (const origin of origins(ref[1], [...visited, key])) result.add(origin);
    }
    return result;
  }
  for (const [key] of tokens) {
    if (!/^--brand-(?:blue|orange|cyan|gray)-(?:[1-7])$|^--brand-(?:cyan|orange)-dark$/.test(key)) continue;
    const source = origins(key);
    const family = key.split("-")[2];
    for (const mustHave of family === "gray" ? ["black", "white"] : [family]) {
      assert.ok(source.has("--brand-" + mustHave), key + " no depende de " + mustHave);
    }
  }
  console.log("DEPENDENCIAS: shades y bases ligados sin ciclos");
});

test("Chromium: los colores renderizados de ambos temas responden a las cinco bases", () => {
  const chrome = process.env.CHROME_BIN || "google-chrome";
  const version = spawnSync(chrome, ["--version"], { encoding: "utf8" });
  assert.equal(version.status, 0, "Chrome headless debe estar disponible en CI: " + version.error);
  const dir = mkdtempSync(join(tmpdir(), "brand-chrome-"));
  try {
    // Archivo temporal: no se modifica el CSS ni las bases del repositorio.
    const cssNoImports = css.replace(/@import[^\n]*\n/g, "");
    const html = [
      "<!doctype html><html lang='es'><head><meta charset='utf-8'><style>",
      cssNoImports,
      "</style></head><body>",
      "<div id='surface' style='background:var(--surface-canvas);color:var(--text-primary)'>Prueba</div>",
      "<div id='blue' style='background:var(--brand-blue-4)'></div>",
      "<div id='orange' style='background:var(--brand-orange-2)'></div>",
      "<svg xmlns='http://www.w3.org/2000/svg'><circle id='cyan' fill='var(--brand-cyan)' r='10'/></svg>",
      "<pre id='report'></pre><script>",
      "const swatch = id => getComputedStyle(document.getElementById(id));",
      "const snapshot = theme => {document.documentElement.setAttribute('data-theme',theme); return {",
      "surface:swatch('surface').backgroundColor, text:swatch('surface').color,",
      "blue:swatch('blue').backgroundColor, orange:swatch('orange').backgroundColor,",
      "cyan:swatch('cyan').fill};};",
      "const beforeLight=snapshot('light'),beforeDark=snapshot('dark');",
      "const alternate=" + JSON.stringify(alternative) + ";",
      "for(const [key,value] of Object.entries(alternate)) document.documentElement.style.setProperty('--brand-'+key,value);",
      "const afterLight=snapshot('light'),afterDark=snapshot('dark');",
      "document.getElementById('report').textContent=JSON.stringify({beforeLight,beforeDark,afterLight,afterDark});",
      "</script></body></html>",
    ].join("");
    const filepath = join(dir, "palette.html");
    writeFileSync(filepath, html);
    const result = spawnSync(chrome, [
      "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
      "--no-first-run", "--disable-background-networking",
      "--virtual-time-budget=3500", "--dump-dom", "file://" + filepath,
    ], { encoding: "utf8", timeout: 20000, maxBuffer: 6 * 1024 * 1024 });
    assert.equal(result.status, 0, result.stderr?.slice(-2000));
    const match = result.stdout.match(/<pre id="report">([^<]+)<\/pre>/);
    assert.ok(match, "Chromium no devolvió la muestra computada: " + result.stdout.slice(-1000));
    const colors = JSON.parse(match[1].replaceAll("&amp;", "&"));
    for (const theme of ["Light", "Dark"]) {
      const before = colors["before" + theme];
      const after = colors["after" + theme];
      for (const key of ["surface", "text", "blue", "orange", "cyan"]) {
        assert.notEqual(after[key], before[key], theme + " / " + key + " no cambió");
        assert.notEqual(after[key], "", theme + " / " + key + " vacío");
      }
    }
    console.log("CHROMIUM: cinco superficies reales actualizadas en light y dark");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
