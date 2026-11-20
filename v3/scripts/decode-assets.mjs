// Decodifica los assets binarios del v3 que viajan como base64 (.b64),
// porque el conector de GitHub no sube binarios. Solo crea el archivo
// si falta: en local las fotos reales ya existen y no se tocan.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pairs = [
  ["assets-b64/work/chrome-amber.jpg.b64", "public/work/chrome-amber.jpg"],
  ["assets-b64/work/chrome-blue.jpg.b64", "public/work/chrome-blue.jpg"],
  ["assets-b64/work/chrome-silver.jpg.b64", "public/work/chrome-silver.jpg"],
  ["assets-b64/work/glass-spheres.jpg.b64", "public/work/glass-spheres.jpg"],
  ["assets-b64/favicon.ico.b64", "src/app/favicon.ico"],
];
for (const [src, dst] of pairs) {
  const from = join(root, src);
  const to = join(root, dst);
  if (!existsSync(from)) {
    console.log("falta", src);
    continue;
  }
  if (existsSync(to)) {
    console.log("ya existe", dst);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  writeFileSync(to, Buffer.from(readFileSync(from, "utf8").trim(), "base64"));
  console.log("decodificado", dst);
}
