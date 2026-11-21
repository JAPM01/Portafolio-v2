import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/use-motion-prefs";

/**
 * Cursor personalizado SUTIL: un punto + un anillo que siguen al puntero
 * con inercia (solo transform/opacity, rAF). Nunca sustituye al cursor
 * nativo (que sigue visible) y no se monta en táctil (pointer: coarse)
 * ni con prefers-reduced-motion. El anillo crece sobre elementos
 * interactivos (a, button, [role="button"]).
 */
export function CursorDot() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    let tx = -100, ty = -100;
    let dx = -100, dy = -100, rx = -100, ry = -100;
    let raf = 0;
    const onMove = (e: PointerEvent) => { tx = e.clientX; ty = e.clientY; };
    const onOver = (e: MouseEvent) => {
      const hot = (e.target as HTMLElement | null)?.closest?.("a, button, [role=\"button\"]");
      ring.classList.toggle("cursor-hot", !!hot);
    };
    const loop = () => {
      dx += (tx - dx) * 0.4; dy += (ty - dy) * 0.4;
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden><span className="cursor-ring-inner" /></div>
      <div ref={dotRef} className="cursor-dot" aria-hidden><span className="cursor-dot-inner" /></div>
    </>
  );
}
