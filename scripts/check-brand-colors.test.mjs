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

test("ROJO: un color no autorizado produce salida 1 y bloquea el build", () => {
  const folder = mkdtempSync(join(tmpdir(), "brand-red-"));
  try {
    const fixture = join(folder, "invalid.css");
    // Fixture fuera del repositorio: nunca se modifica código productivo.
    writeFileSync(fixture, ".invalid { background: #C0FFEE; }\n");
    const result = spawnSync(process.execPath, [script, "--fixture", fixture], {
      encoding: "utf8",
    });
    assert.equal(result.status, 1, "El detector debía fallar (salida 1)");
    assert.match(result.stderr, /COLOR GUARD: ROJO/);
    assert.match(result.stderr, /hexadecimal no autorizado/);
    console.log("ROJO DEMOSTRADO (exit code 1):\n" + result.stderr.trim());
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
