import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "../../hooks/use-motion-prefs";

export function SmoothScroll() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } });
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, [reduced]);
  return null;
}
