#!/usr/bin/env node
/**
 * Guardia de color: cinco bases editables y ninguna otra fuente de color.
 * Se ejecuta sobre el código de producción (CSS, React, WebGL y SVG).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = ["src", "public", "scripts"];
const EXTENSIONS = /\.(?:css|scss|tsx?|jsx?|mjs|cjs|svg|glsl|wgsl)$/i;
const EXCLUDED = new Set([
  "scripts/check-brand-colors.mjs",
  "scripts/check-brand-colors.test.mjs",
]);
const PALETTE_FILE = "src/app/globals.css";
const BASES = ["blue", "orange", "cyan", "black", "white"];
const DECLARATION = /^\s*--brand-(blue|orange|cyan|black|white):\s*(#[0-9a-f]{6});\s*$/i;
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![a-z0-9_-])/gi;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/gi;
const NAMED = /\b(?:background|background-color|border-color|outline-color|color|fill|stroke|stop-color|stopColor|fillStyle|strokeStyle|shadowColor)\s*(?::|=)\s*["']?\s*(?:black|white|red|blue|green|orange|cyan|gray|grey|magenta|yellow|purple|pink|navy|teal|lime|silver|maroon|aqua|fuchsia|rebeccapurple)\b/gi;
const FALLBACK = /\bvar\(\s*--[\w-]+\s*,\s*(?:black|white|red|blue|green|orange|cyan|gray|grey|magenta|yellow|purple|pink|navy|teal|lime|silver|maroon|aqua|fuchsia)\s*\)/gi;
const FIXED_SHADER = /gl_FragColor\s*=\s*vec4\s*\(\s*(?:[0-9]+\.)?[0-9]+\s*[,)]/gi;

function filesIn(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) filesIn(full, found);
    else if (entry.isFile() && EXTENSIONS.test(entry.name)) {
      const name = relative(ROOT, full).replaceAll("\\", "/");
      if (!EXCLUDED.has(name)) found.push({ name, full });
    }
  }
  return found;
}

function auditFile(name, content) {
  const problems = [];
  const definitions = new Map();
  const lines = content.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    const position = name + ":" + (index + 1);
    const match = name === PALETTE_FILE ? line.match(DECLARATION) : null;
    if (match) {
      const key = match[1].toLowerCase();
      definitions.set(key, (definitions.get(key) ?? 0) + 1);
    }

    for (const hex of line.matchAll(HEX)) {
      if (match && hex[0].toLowerCase() === match[2].toLowerCase()) continue;
      problems.push(position + ": hexadecimal no autorizado " + hex[0]);
    }

    if (/--brand-(blue|orange|cyan|black|white)\s*:/i.test(line) && !match) {
      problems.push(position + ": redefinición de color base fuera de la paleta");
    }

    for (const func of line.matchAll(COLOR_FUNCTION)) {
      const after = line.slice(func.index + func[0].length);
      if (!/^\s*from\s+var\(\s*--[\w-]+\s*\)/i.test(after)) {
        problems.push(position + ": función de color literal " + func[0]);
      }
    }

    if (NAMED.test(line) || FALLBACK.test(line)) {
      problems.push(position + ": nombre de color literal no autorizado");
    }
    if (FIXED_SHADER.test(line)) {
      problems.push(position + ": componente RGB numérico fijo en un shader");
    }
    NAMED.lastIndex = FALLBACK.lastIndex = FIXED_SHADER.lastIndex = 0;
  }
  return { problems, definitions };
}

function audit() {
  const fixtureIndex = process.argv.indexOf("--fixture");
  if (fixtureIndex >= 0) {
    const path = process.argv[fixtureIndex + 1];
    if (!path) throw new Error("--fixture requiere un archivo");
    return auditFile("src/__fixture_roja__.css", readFileSync(path, "utf8")).problems;
  }

  const errors = [];
  const definitions = new Map();
  for (const folder of SOURCE) {
    for (const file of filesIn(join(ROOT, folder))) {
      const found = auditFile(file.name, readFileSync(file.full, "utf8"));
      errors.push(...found.problems);
      if (file.name === PALETTE_FILE) {
        for (const [key, count] of found.definitions) definitions.set(key, count);
      }
    }
  }
  for (const base of BASES) {
    if (definitions.get(base) !== 1) {
      errors.push(PALETTE_FILE + ": la base --brand-" + base + " debe declararse exactamente una vez");
    }
  }
  return errors;
}

const violations = audit();
if (violations.length) {
  console.error("COLOR GUARD: ROJO (" + violations.length + " infracciones)");
  for (const problem of violations) console.error(" - " + problem);
  process.exitCode = 1;
} else {
  console.log("COLOR GUARD: VERDE. Solo las cinco bases definidas en globals.css.");
}
