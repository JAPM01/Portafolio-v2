/** Geometría "flute" exacta de la referencia, extraída de sus chunks JS
    (módulo fluteGeometry/flutePeriod + hook de PanelLines).
    Verificado: a 1440x900, DPR 1, da tile 233.168px y offset 19.995px,
    idénticos a los medidos en las 4 páginas /work de la referencia. */

export const HERO_PLATE_ASPECT = 3840 / 2152;
export const FLUTE_SIZE_TO = 0.955;

export function flutePeriod(
  canvasW: number,
  canvasH: number,
  rectW: number,
  rectLeft: number,
  fluteSize: number,
  aspect: number
): { period: number; count: number; anchor: number } | null {
  if (!(canvasW > 0 && canvasH > 0 && rectW > 0 && aspect > 0)) return null;
  const a = Math.max(canvasW / aspect, canvasH) * aspect;
  const count = (canvasW / a) * (200 - 195 * fluteSize);
  return count > 0.5
    ? { period: rectW / count, count, anchor: rectLeft + rectW / 2 }
    : null;
}

/** Ref: !isFinePointer() && min(innerWidth, innerHeight) <= 480. */
export function isPhone(): boolean {
  return (
    !window.matchMedia("(pointer: fine)").matches &&
    Math.min(window.innerWidth, window.innerHeight) <= 480
  );
}
