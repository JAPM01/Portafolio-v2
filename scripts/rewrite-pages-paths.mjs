// Reescribe las URLs absolutas de la marca en los CSS exportados
// (url(/brand/mark.svg) -> url(/Portafolio-v2/brand/mark.svg)) para
// servir el sitio bajo el basePath de GitHub Pages. Los <img> y <a>
// ya llevan el prefijo desde el código (src/lib/paths.ts); el CSS no
// puede leer variables de entorno, así que se ajusta aquí, tras el build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

if (!BASE) {
  console.log("Sin NEXT_PUBLIC_BASE_PATH: nada que reescribir.");
  process.exit(0);
}

let changed = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (p.endsWith(".css")) {
      const s = fs.readFileSync(p, "utf8");
      if (s.includes("/brand/mark.svg") && !s.includes(`${BASE}/brand/mark.svg`)) {
        fs.writeFileSync(p, s.split("/brand/mark.svg").join(`${BASE}/brand/mark.svg`));
        changed++;
        console.log("reescrito:", path.relative(OUT, p));
      }
    }
  }
}
walk(OUT);
console.log(`OK: ${changed} archivos CSS reescritos con base ${BASE}`);
