/** Source of truth for JS/WebGL palette colors. Mirror values in
 * src/app/globals.css --brand-* CSS custom properties.
 * Base shades are derived in OKLCH from #000AFF and #FF9636.
 * Neutral shades have zero chroma.
 */
export const BRAND_PALETTE = {
  blue: ["#000AFF", "#353FF3", "#5C65F3", "#878AF8", "#ACB0F6", "#D3D6FA", "#ECEEFF"],
  orange: ["#FF9636", "#FDAE71", "#FFC69B"],
  gray: ["#070707", "#303030", "#585858", "#808080", "#A4A4A4", "#CECECE", "#EBEBEB"],
} as const;

export function brandRgb01(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
