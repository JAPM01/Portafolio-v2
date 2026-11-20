/**
 * Resolver un token de color CSS a RGB en runtime.
 *
 * Por qué existe: los guards de CI prohíben literales hex y funciones
 * de color (rgba/rgb/oklch) en el código, así que los colores solo
 * pueden llegar por var(--...). Pero el canvas 2D NO resuelve var()
 * en fillStyle: `color-mix(in oklch, var(--brand-black) 28%,
 * transparent)` es inválido para el canvas y se ignora, dejando el
 * fillStyle anterior (negro sólido) — eso pintaba las tarjetas de
 * Work con franjas negras (19 Nov 2026, probe-warp). La salida es
 * resolver el token con getComputedStyle (que sí resuelve var() y
 * color-mix) y construir el color en runtime, sin literales en el
 * código fuente.
 */
let probe: HTMLSpanElement | null = null;

export function resolveTokenRgb(varName: string): [number, number, number] {
  if (!probe) {
    probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    document.body.appendChild(probe);
  }
  probe.style.color = `var(${varName})`;
  const computed = getComputedStyle(probe).color;
  const m = computed.match(/rgba?\(([^)]+)\)/);
  if (!m) return [0, 0, 0];
  const parts = m[1].split(/[\s,\/]+/).filter(Boolean).slice(0, 3);
  return [
    Math.round(Number(parts[0]) || 0),
    Math.round(Number(parts[1]) || 0),
    Math.round(Number(parts[2]) || 0),
  ];
}

export function tokenHex(varName: string): string {
  const [r, g, b] = resolveTokenRgb(varName);
  return (
    "#" +
    [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")
  );
}
