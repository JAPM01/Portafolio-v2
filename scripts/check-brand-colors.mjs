#!/usr/bin/env node
/**
 * Política de identidad cromática — un único origen CSS.
 * No modifica archivos: valida semánticamente las bases, shades,
 * dependencias, componentes, shaders, SVG y fuentes de color codificadas.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const BASES = ["blue", "orange", "cyan", "black", "white", "red"];
const SHADE_NAMES = [
  ...Array.from({ length: 7 }, (_, n) => "blue-" + (n + 1)),
  ...Array.from({ length: 3 }, (_, n) => "orange-" + (n + 1)),
  ...Array.from({ length: 3 }, (_, n) => "cyan-" + (n + 1)),
  ...Array.from({ length: 7 }, (_, n) => "gray-" + (n + 1)),
  "orange-dark", "cyan-dark",
];
const VALID_BRAND = new Set([...BASES, ...SHADE_NAMES]);
const ROOT_CSS = "src/app/globals.css";
const EXTENSIONS = /\.(?:css|scss|tsx?|jsx?|js|mjs|cjs|svg|glsl|wgsl)$/i;
const SKIP = new Set([
  "scripts/check-brand-colors.mjs",
  "scripts/check-brand-colors.test.mjs",
  "scripts/test-brand-propagation.mjs",
  "scripts/check-typography.mjs",
  "scripts/check-typography.test.mjs",
  "scripts/test-typography-propagation.mjs",
]);
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![a-z0-9_-])/gi;
const COLOR_FUN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\s*\(/gi;
const COLOR_NAMES = new Set((
  "aliceblue antiquewhite aqua aquamarine azure beige bisque blanchedalmond blue blueviolet brown burlywood " +
  "cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod " +
  "darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon " +
  "darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue " +
  "dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod " +
  "gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen " +
  "lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink " +
  "lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen " +
  "linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue " +
  "mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite " +
  "navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred " +
  "papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown " +
  "salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen " +
  "steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen black"
).split(/\s+/));
const CLEAR_LINE = "gl.clearColor(0, 0, 0, 1);";
const OPTICAL_FILE = "src/components/FluidBackground.tsx";

function withoutComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/[^\n]*/gm, match => " ".repeat(match.length));
}

function findFiles(dir, items = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full, items);
    else if (entry.isFile() && EXTENSIONS.test(entry.name)) {
      const name = relative(ROOT, full).replaceAll("\\", "/");
      // TEMPORAL experimento Melon: los assets en public/exp/ son de terceros
      // (wordmark y logos de Melon y de sus clientes, con sus propios colores)
      // y no forman parte del sistema de marca de Jafet. No se les aplica el guard.
      if (name.startsWith("public/exp/")) continue;
      if (!SKIP.has(name)) items.push({ name, text: readFileSync(full, "utf8") });
    }
  }
  return items;
}

function at(text, index) {
  return text.slice(0, index).split("\n").length;
}

function bracket(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")" && --depth === 0) return text.slice(openIndex + 1, i);
  }
  return "";
}

function scanColorFunctions(name, source, errors) {
  for (const func of source.matchAll(COLOR_FUN)) {
    const kind = func[0].trim().replace(/\s*\($/, "").toLowerCase();
    const args = bracket(source, func.index + func[0].lastIndexOf("("));
    const safeChannels = {
      rgb: "r g b",
      rgba: "r g b",
      oklch: "l c h",
      oklab: "l a b",
      hsl: "h s l",
      hsla: "h s l",
    };
    const channels = safeChannels[kind];
    if (channels) {
      const expected = new RegExp(
        "^\\s*from\\s+var\\(\\s*--[\\w-]+\\s*\\)\\s+" +
        channels.split(" ").join("\\s+") +
        "(?:\\s*\\/\\s*(?:[\\d.]+|calc\\([\\s\\S]+\\)|var\\([\\s\\S]+\\)))?\\s*$",
        "s"
      );
      if (expected.test(args)) continue;
    }
    errors.push(name + ":" + at(source, func.index) + ": color literal/función no derivada de tokens: " + kind + "(");
  }
}

function checkNamedColors(name, source, errors) {
  const css = /\.(?:css|scss|svg)$/.test(name);
  if (css) {
    // Inspección de valores de declaraciones, también en gradientes.
    const decl = /(?:^|[;{}])\s*([-\w]+)\s*:\s*([^;{}]+)(?=[;}])/gm;
    for (const entry of source.matchAll(decl)) {
      const prop = entry[1], value = entry[2];
      if (prop === "content" || prop === "font-family" || prop === "font") continue;
      // Los nombres dentro de var() y url() son identificadores, no colores.
      const raw = value.replace(/var\([^)]*\)/g, " ").replace(/url\([^)]*\)/g, " ")
        .replace(/["'][^"']*["']/g, " ");
      for (const word of raw.matchAll(/\b[a-z][a-z0-9]*\b/gi)) {
        if (COLOR_NAMES.has(word[0].toLowerCase())) {
          errors.push(name + ":" + at(source, entry.index) + ": nombre de color no autorizado: " + word[0]);
        }
      }
    }
  }
  // Los atributos SVG/JSX y propiedades de estilo de React se revisan también.
  const literalAttribute = /\b(?:fill|stroke|stopColor|stop-color|background|backgroundColor|color|fillStyle|strokeStyle)\s*(?::|=)\s*["']([^"']+)["']/gi;
  for (const entry of source.matchAll(literalAttribute)) {
    if (COLOR_NAMES.has(entry[1].toLowerCase())) {
      errors.push(name + ":" + at(source, entry.index) + ": literal de color: " + entry[1]);
    }
  }
}

function scanFile(name, raw, errors) {
  const text = withoutComments(raw);
  const allowedBase = /^\s*--brand-(blue|orange|cyan|black|white|red):\s*(#[a-f0-9]{6});\s*$/i;
  const lines = text.split("\n");

  for (const [i, line] of lines.entries()) {
    const isBase = name === ROOT_CSS ? line.match(allowedBase) : null;
    for (const match of line.matchAll(HEX)) {
      if (isBase && match[0].toLowerCase() === isBase[2].toLowerCase()) continue;
      errors.push(name + ":" + (i + 1) + ": hexadecimal independiente " + match[0]);
    }
  }

  // Los SVG encapsulados deben decodificarse antes de la validación.
  for (const match of text.matchAll(/data:image\/svg\+xml(?:;charset=[\w-]+)?[,;][^\s"']+/gi)) {
    let decoded = match[0];
    try {
      if (/;base64,/i.test(decoded)) {
        decoded = Buffer.from(decoded.split(";base64,")[1], "base64").toString("utf8");
      } else {
        decoded = decodeURIComponent(decoded);
      }
      // Se chequea con un nombre de recurso artificial, sin autorizar bases.
      scanFile(name + ":SVG-embebido", decoded, errors);
    } catch {
      errors.push(name + ":" + at(text, match.index) + ": SVG embebido ilegible");
    }
  }
  for (const encoded of text.matchAll(/%23(?:[a-f0-9]{8}|[a-f0-9]{6}|[a-f0-9]{4}|[a-f0-9]{3})(?![a-z0-9_-])/gi)) {
    errors.push(name + ":" + at(text, encoded.index) + ": color hexadecimal URL-encoded " + encoded[0]);
  }

  scanColorFunctions(name, text, errors);
  checkNamedColors(name, text, errors);

  // Las declaraciones brand solo pueden aparecer en globals.css.
  for (const declaration of text.matchAll(/--brand-([a-z0-9-]+)\s*:/gi)) {
    const token = declaration[1].toLowerCase();
    if (name !== ROOT_CSS || !VALID_BRAND.has(token)) {
      errors.push(name + ":" + at(text, declaration.index) +
        ": redefinición o nueva familia de brand fuera de la fuente oficial " + token);
    }
  }

  // Los placeholders externos no pueden depender de herencia CSS.
  if (name.startsWith("public/") && name.endsWith(".svg") &&
      name !== "public/brand/mark.svg" && /currentColor/i.test(text)) {
    errors.push(name + ": SVG externo con currentColor no heredable");
  }
  if (name === "public/brand/mark.svg" && !/viewBox/.test(text)) {
    errors.push(name + ": el SVG usado como máscara necesita viewBox");
  }

  // gl.clearColor inicializa un framebuffer: la excepción es exactamente
  // el clear matemático de la simulación, en un único sitio revisado.
  for (const entry of text.matchAll(/gl\.clearColor\s*\([^)]*\)\s*;/g)) {
    if (name !== OPTICAL_FILE || entry[0] !== CLEAR_LINE ||
        !raw.includes("COLOR_GUARD_OPTICAL_CLEAR")) {
      errors.push(name + ":" + at(text, entry.index) + ": gl.clearColor literal no autorizado");
    }
  }
  for (const match of text.matchAll(/gl\.uniform3f\s*\(\s*[^,]+,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/g)) {
    errors.push(name + ":" + at(text, match.index) + ": pigmento WebGL numérico literal");
  }

  // La fuente CSS controla todos los uniforms de color del shader hero.
  if (name === "src/components/FlowGradientBackground.tsx") {
    if (/colors\s*\?\s*:|colors\s*,|s\.colors\b/.test(text) ||
        !text.includes("readMeshPalette()") ||
        !text.includes("gl.uniform3f(loc, ...brandRgb01(brandColors[i]))")) {
      errors.push(name + ": el mesh acepta una paleta alternativa o no consume exclusivamente las bases CSS");
    }
  }
}

function rootBlock(css) {
  const match = css.match(/:root\s*\{([\s\S]*?)^\}/m);
  return match?.[1] ?? "";
}

function validateGraph(css, errors) {
  const root = rootBlock(withoutComments(css));
  if (!root) { errors.push(ROOT_CSS + ": falta el bloque :root"); return; }
  const declarations = [...root.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)];
  const grouped = new Map();
  for (const entry of declarations) {
    const key = entry[1], list = grouped.get(key) || [];
    list.push(entry[2].trim());
    grouped.set(key, list);
  }

  for (const base of BASES) {
    const entry = grouped.get("--brand-" + base) ?? [];
    if (entry.length !== 1 || !/^#[a-f0-9]{6}$/i.test(entry[0])) {
      errors.push(ROOT_CSS + ": la base --brand-" + base + " debe tener una única declaración hexadecimal");
    }
  }
  const state = new Map();
  const roots = new Map();
  function descend(token, stack = []) {
    if (state.get(token) === "done") return roots.get(token);
    if (state.get(token) === "visiting") {
      errors.push(ROOT_CSS + ": ciclo de tokens cromáticos " + [...stack, token].join(" -> "));
      return new Set();
    }
    const defs = grouped.get(token);
    if (!defs || defs.length !== 1) {
      errors.push(ROOT_CSS + ": token cromático indefinido o duplicado " + token);
      return new Set();
    }
    state.set(token, "visiting");
    const result = new Set();
    if (BASES.some(base => token === "--brand-" + base)) {
      result.add(token);
    } else {
      const expr = defs[0];
      for (const match of expr.matchAll(/var\(\s*(--[\w-]+)/g)) {
        for (const root of descend(match[1], [...stack, token])) result.add(root);
      }
      if (!result.size) {
        errors.push(ROOT_CSS + ": token derivado sin dependencia de marca " + token);
      }
    }
    roots.set(token, result);
    state.set(token, "done");
    return result;
  }

  for (const shade of SHADE_NAMES) {
    const key = "--brand-" + shade, defs = grouped.get(key) ?? [];
    if (defs.length !== 1) {
      errors.push(ROOT_CSS + ": shade ausente o duplicado " + key);
      continue;
    }
    const value = defs[0];
    if (!/^(?:var\(\s*--brand-[\w-]+\s*\)|color-mix\(\s*in\s+(?:oklch|srgb|oklab)[\s\S]*\))$/i.test(value)) {
      errors.push(ROOT_CSS + ": shade con fórmula no autorizada " + key);
    }
    for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (!ref[1].startsWith("--brand-")) {
        errors.push(ROOT_CSS + ": shade no derivado exclusivamente del brand " + key);
      }
    }
    const derivedFrom = descend(key);
    const family = shade.split("-")[0];
    const required = family === "gray"
      ? shade === "gray-1" ? ["black"] : ["black", "white"]
      : [family];
    for (const base of required) {
      if (!derivedFrom.has("--brand-" + base)) {
        errors.push(ROOT_CSS + ": el shade " + key +
          " no depende de su base cromática --brand-" + base);
      }
    }
  }

  for (const [token, values] of grouped) {
    if (token.startsWith("--brand-") &&
        !VALID_BRAND.has(token.slice("--brand-".length))) {
      errors.push(ROOT_CSS + ": familia de marca adicional " + token);
    }
    if (!token.startsWith("--brand-") &&
        /^(--primary-|--neutral-|--surface-|--text-(?:primary|secondary|disabled|inverse|link)|--border-|--semantic-|--success-|--danger-|--warning-|--white-(?:primary|secondary))/.test(token)) {
      const value = values[0] ?? "";
      for (const ref of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
        descend(ref[1]);
      }
    }
  }

  // Redefiniciones del brand fuera del :root son ilegales (temas incluidos).
  const outsideRoot = withoutComments(css).replace(/:root\s*\{[\s\S]*?^\}/m, "");
  if (/--brand-[\w-]+\s*:/.test(outsideRoot)) {
    errors.push(ROOT_CSS + ": shade o base redefinida fuera de :root");
  }
}

function audit(files, fixtureName, fixtureText) {
  const errors = [];
  if (fixtureText !== undefined) {
    if (fixtureName === ROOT_CSS) validateGraph(fixtureText, errors);
    scanFile(fixtureName, fixtureText, errors);
    return errors;
  }
  const css = files.find(file => file.name === ROOT_CSS);
  if (css) validateGraph(css.text, errors);
  else errors.push(ROOT_CSS + ": no encontrado");
  for (const file of files) scanFile(file.name, file.text, errors);
  return errors;
}

const fixturePos = process.argv.indexOf("--fixture");
const fixtureNamePos = process.argv.indexOf("--fixture-name");
const filename = fixturePos >= 0 ? process.argv[fixturePos + 1] : undefined;
const fixtureName = fixtureNamePos >= 0 ? process.argv[fixtureNamePos + 1] : "src/__fixture_roja__.css";
if (fixturePos >= 0 && !filename) throw new Error("--fixture requiere ruta");
const problems = filename
  ? audit([], fixtureName, readFileSync(filename, "utf8"))
  : audit(["src", "public", "scripts"].flatMap(dir => findFiles(join(ROOT, dir))));
if (problems.length) {
  console.error("COLOR GUARD: ROJO (" + problems.length + " infracciones)");
  for (const item of problems) console.error(" - " + item);
  process.exitCode = 1;
} else {
  console.log("COLOR GUARD: VERDE. Seis bases, shades vinculados y cero colores independientes.");
}
