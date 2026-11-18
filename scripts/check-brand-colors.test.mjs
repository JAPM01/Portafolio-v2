import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("./check-brand-colors.mjs", import.meta.url));

test("VERDE: solo se utilizan los cinco colores base y sus derivados", () => {
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /COLOR GUARD: VERDE/);
  console.log(result.stdout.trim());
});

const prohibited = [
  ["hexadecimal", ".invalid { background: #C0FFEE; }\n"],
  ["RGB literal", ".invalid { color: rgb(18 90 120); }\n"],
  ["nombre CSS", ".invalid { color: tomato; }\n"],
  ["color display-p3", ".invalid { background: color(display-p3 1 0 0); }\n"],
  ["color base redefinido", ".invalid { --brand-blue: var(--brand-orange); }\n"],
  ["familia nueva", ".invalid { --brand-purple: color-mix(in oklch, var(--brand-blue), var(--brand-orange)); }\n"],
];

for (const [name, content] of prohibited) {
  test("ROJO: prohíbe " + name + " con salida 1", () => {
    const folder = mkdtempSync(join(tmpdir(), "brand-red-"));
    try {
      const fixture = join(folder, "invalid.css");
      // Aislamiento: jamás se introduce un valor falso en los archivos reales.
      writeFileSync(fixture, content);
      const result = spawnSync(process.execPath, [script, "--fixture", fixture], {
        encoding: "utf8",
      });
      assert.equal(result.status, 1, "Debía fallar con salida 1: " + name);
      assert.match(result.stderr, /COLOR GUARD: ROJO/);
      console.log("ROJO DEMOSTRADO [" + name + "] (exit code 1): " +
        result.stderr.split("\n").filter(Boolean).at(-1));
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
}
