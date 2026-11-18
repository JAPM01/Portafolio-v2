import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./check-brand-colors.mjs", import.meta.url));
const baseCss = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

function runGuard(content, name = "src/__fixture_roja__.css") {
  const folder = mkdtempSync(join(tmpdir(), "brand-red-"));
  try {
    const file = join(folder, "forbidden.txt");
    writeFileSync(file, content);
    return spawnSync(process.execPath, [script, "--fixture", file, "--fixture-name", name], {
      encoding: "utf8",
    });
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

test("VERDE — repositorio sin colores externos", () => {
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /COLOR GUARD: VERDE/);
  console.log(result.stdout.trim());
});

const red = [
  ["hexadecimal 6 dígitos", ".invalid { background: #C0FFEE; }"],
  ["hexadecimal con transparencia", ".invalid { background: #FF000088; }"],
  ["RGB literal", ".invalid { color: rgb(18 90 120); }"],
  ["HSL literal", ".invalid { color: hsl(330 80% 50%); }"],
  ["nombre CSS desconocido", ".invalid { color: tomato; }"],
  ["nombre dentro de un gradiente", ".invalid { background: linear-gradient(var(--brand-blue), tomato); }"],
  ["nombre dentro de color-mix", ".invalid { color: color-mix(in oklch, tomato, var(--brand-orange)); }"],
  ["display-p3", ".invalid { background: color(display-p3 1 0 0); }"],
  ["RGB relativo con canales fijos", ".invalid { background: rgb(from var(--brand-blue) 255 0 0); }"],
  ["RGB relativo con un canal fijo", ".invalid { background: rgb(from var(--brand-blue) r g 0); }"],
  ["SVG hexadecimal URL-encoded", "const uri = \"data:image/svg+xml,%3Csvg%3E%3Crect fill='%23ffffff'/%3E%3C/svg%3E\";"],
  ["SVG Base64", "const uri = \"data:image/svg+xml;base64," +
    Buffer.from("<svg><rect fill='#ff00ff'/></svg>").toString("base64") + "\";"],
  ["SVG externo currentColor", "<svg xmlns=\"http://www.w3.org/2000/svg\"><rect fill=\"currentColor\"/></svg>",
    "public/placeholder.svg"],
  ["nueva familia", ".invalid { --brand-purple: var(--brand-blue); }"],
  ["base sobrescrita", ".invalid { --brand-blue: var(--brand-orange); }"],
  ["shader con paleta alternativa", "export type Props = { colors?: string[] };",
    "src/components/FlowGradientBackground.tsx"],
  ["framebuffer con otro color", "gl.clearColor(1, 0, 0, 1);",
    "src/components/FluidBackground.tsx"],
  ["pigmento WebGL fijo", "gl.uniform3f(loc, 1, 0, 0);",
    "src/components/SomeEffect.tsx"],
];
for (const [description, sample, path] of red) {
  test("ROJO — " + description + " impide despliegue", () => {
    const result = runGuard(sample, path);
    assert.equal(result.status, 1, description + "\n" + result.stderr);
    assert.match(result.stderr, /COLOR GUARD: ROJO/);
    console.log("ROJO " + description + ": exit 1 confirmado");
  });
}

function altered(before, after) {
  assert.ok(baseCss.includes(before), "La muestra base de globals.css cambió: " + before);
  return baseCss.replace(before, after);
}

const shadeViolations = [
  ["ciclo entre shades",
    altered("--brand-blue-2: color-mix(in oklch, var(--brand-blue) 86%, var(--brand-white));",
      "--brand-blue-2: var(--brand-blue-3);")
      .replace("--brand-blue-3: color-mix(in oklch, var(--brand-blue) 72%, var(--brand-white));",
        "--brand-blue-3: var(--brand-blue-2);")],
  ["shade sin base azul",
    altered("--brand-blue-2: color-mix(in oklch, var(--brand-blue) 86%, var(--brand-white));",
      "--brand-blue-2: var(--brand-orange);")],
  ["shade literal ajeno",
    altered("--brand-blue-2: color-mix(in oklch, var(--brand-blue) 86%, var(--brand-white));",
      "--brand-blue-2: rgb(1 2 3);")],
  ["base duplicada",
    altered("  --brand-blue: #000AFF;",
      "  --brand-blue: #000AFF;\n  --brand-blue: #000AFF;")],
  ["shade redefinido en tema",
    baseCss + '\n[data-theme="dark"] { --brand-blue-2: var(--brand-cyan); }\n'],
  ["shade no declarado",
    baseCss.replace(/^\s*--brand-orange-2:[^\n]*\n/m, "")],
];
for (const [description, sample] of shadeViolations) {
  test("ROJO — " + description, () => {
    const result = runGuard(sample, "src/app/globals.css");
    assert.equal(result.status, 1, description + "\n" + result.stderr);
    assert.match(result.stderr, /COLOR GUARD: ROJO/);
    console.log("ROJO " + description + ": exit 1 confirmado");
  });
}

test("VERDE recuperado — la paleta real supera las dependencias", () => {
  const result = runGuard(baseCss, "src/app/globals.css");
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /COLOR GUARD: VERDE/);
});
