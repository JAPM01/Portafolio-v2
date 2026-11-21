// Decodifica los assets binarios del v4 que viajan como base64 (.b64),
// porque el conector de GitHub no sube binarios. Solo crea el archivo
// si falta: en local las fotos reales ya existen y no se tocan.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pairs = [
  ["assets-b64/work-halcyon.jpg.b64", "src/assets/work-halcyon.jpg"],
  ["assets-b64/work-norda.jpg.b64", "src/assets/work-norda.jpg"],
  ["assets-b64/work-orbital.jpg.b64", "src/assets/work-orbital.jpg"],
  ["assets-b64/favicon.ico.b64", "public/favicon.ico"],
  ["assets-b64/fonts/GeneralSans-Regular.woff2.b64", "public/fonts/GeneralSans-Regular.woff2"],
  ["assets-b64/fonts/GeneralSans-Medium.woff2.b64", "public/fonts/GeneralSans-Medium.woff2"],
  ["assets-b64/fonts/GeneralSans-Semibold.woff2.b64", "public/fonts/GeneralSans-Semibold.woff2"],
  ["assets-b64/fonts/GeneralSans-Bold.woff2.b64", "public/fonts/GeneralSans-Bold.woff2"],
  ["assets-b64/fonts/GeistMono-Regular.woff2.b64", "public/fonts/GeistMono-Regular.woff2"],
  ["assets-b64/fonts/GeistMono-Medium.woff2.b64", "public/fonts/GeistMono-Medium.woff2"],
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
