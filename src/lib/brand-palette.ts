/**
 * Adaptador de CSS -> Canvas/WebGL.
 * src/app/globals.css es la ÚNICA fuente de valores de marca:
 * este archivo nunca declara un hexadecimal propio.
 *
 * Leer las bases en el navegador hace que los shaders consuman la
 * misma identidad que el resto del CSS, sin duplicar constantes.
 */
export type BrandBase = "blue" | "orange" | "cyan" | "black" | "white";

export function brandHex(name: BrandBase): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--brand-${name}`).trim();
  if (!/^#[\da-f]{6}$/i.test(value)) {
    throw new Error(`Token de marca no definido o inválido: --brand-${name}`);
  }
  return value;
}

export function readBrandPalette() {
  return {
    blue: brandHex("blue"),
    orange: brandHex("orange"),
    cyan: brandHex("cyan"),
    black: brandHex("black"),
    white: brandHex("white"),
  };
}

export function brandRgb01(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

/** Tono derivado de las mismas bases CSS, con mezcla sRGB explícita.
 *  Se emplea para el reflejo blanco-cian del shader, sin introducir
 *  una sexta fuente de color.
 */
export function mixHex(base: string, accent: string, accentFraction: number) {
  const b = brandRgb01(base), a = brandRgb01(accent);
  return "#" + b.map((channel, i) =>
    Math.round((channel * (1 - accentFraction) + a[i] * accentFraction) * 255)
      .toString(16).padStart(2, "0")
  ).join("");
}

export function readMeshPalette(): [string, string, string, string, string] {
  const c = readBrandPalette();
  return [c.black, c.blue, c.cyan, c.orange, mixHex(c.white, c.cyan, 0.16)];
}
