import { useEffect, type RefObject } from "react";

/**
 * Reveal "liquid" de los títulos de sección de Melon (revisión técnica,
 * 19 Nov 2026): al hacer scroll, el título entra borroso (hasta 40px) y
 * se enfoca al subir desde el borde inferior del viewport hasta el 40%
 * desde arriba (ScrollTrigger scrub: start "top bottom", end "top 40%";
 * config de Melon: max 40, exp 1.6). Aquí sin el canvas de pixelación
 * de Melon: blur + opacidad con la misma curva.
 *
 * Uso: pasar el ref del título; el hook fija --liq-blur y --liq-op en
 * el elemento. El CSS del título debe usar:
 *   filter: blur(var(--liq-blur, 40px));
 *   opacity: var(--liq-op, 0);
 */
export function useLiquidReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--liq-blur", "0px");
      el.style.setProperty("--liq-op", "1");
      return;
    }
    const MAX_BLUR = 40;
    const EXP = 1.6;
    const target: HTMLElement = el;
    let raf = 0;
    let last = -1;

    function update() {
      raf = 0;
      const vpH = window.innerHeight;
      const rect = target.getBoundingClientRect();
      // Progreso: 0 cuando el top del título toca el borde inferior del
      // viewport, 1 cuando llega al 40% desde arriba.
      const start = vpH;
      const end = vpH * 0.4;
      const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      if (p === last) return;
      last = p;
      const blur = MAX_BLUR * Math.pow(1 - p, EXP);
      target.style.setProperty("--liq-blur", blur.toFixed(2) + "px");
      target.style.setProperty("--liq-op", p.toFixed(3));
    }

    function onScroll() {
      if (!raf) raf = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [ref]);
}
