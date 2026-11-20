import { useEffect, type RefObject } from "react";
import { resolveTokenRgb } from "./colorTokens";

/**
 * Reveal "liquid" de los títulos de sección de Melon (revisión técnica,
 * 19 Nov 2026 + CSS capturado de melon.studio):
 * - ScrollTrigger scrub: start "top bottom", end "top 40%".
 * - Blur hasta 40px desktop (móvil ≈14px), exp 1.6.
 * - Pixelación por canvas (Melon: steps 24, scale .5, delay 200): el
 *   título se dibuja en un canvas de baja resolución y se amplía sin
 *   suavizado, con opacidad (1-p); el texto real entra con blur+opacidad.
 * - Transición de color: rojo borroso -> color final (blanco en fondo
 *   oscuro, oscuro en fondo crema).
 *
 * Uso: pasar el ref del título; el hook fija --liq-blur y --liq-op en
 * el elemento. El CSS del título debe usar:
 *   filter: blur(var(--liq-blur, 40px));
 *   opacity: var(--liq-op, 0);
 * El segundo argumento es la variable CSS del color final del título.
 */
export function useLiquidReveal(
  ref: RefObject<HTMLElement | null>,
  finalColorVar = "--brand-white",
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.style.setProperty("--liq-blur", "0px");
      el.style.setProperty("--liq-op", "1");
      return;
    }
    const MAX_BLUR = window.innerWidth <= 810 ? 14 : 40;
    const EXP = 1.6;
    const target: HTMLElement = el;
    if (window.getComputedStyle(target).position === "static") {
      target.style.position = "relative";
    }
    // Canvas de pixelación superpuesto al título.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "2";
    canvas.style.imageRendering = "pixelated";
    target.appendChild(canvas);

    const off = document.createElement("canvas");
    let raf = 0;
    let last = -1;

    function drawPixelated(p: number) {
      const W = target.clientWidth;
      const H = target.clientHeight;
      if (W === 0 || H === 0) return;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (p >= 0.999) {
        canvas.style.opacity = "0";
        return;
      }
      const cs = window.getComputedStyle(target);
      const fontSize = parseFloat(cs.fontSize) || 16;
      const lineHeight = parseFloat(cs.lineHeight) || fontSize;
      const step = 6; // baja resolución -> bloques de píxel al ampliar
      const ow = Math.max(2, Math.ceil(W / step));
      const oh = Math.max(2, Math.ceil(H / step));
      off.width = ow;
      off.height = oh;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.clearRect(0, 0, ow, oh);
      octx.font = `${cs.fontWeight} ${fontSize / step}px ${cs.fontFamily}`;
      try {
        (octx as unknown as { letterSpacing: string }).letterSpacing =
          `${parseFloat(cs.letterSpacing || "0") / step}px`;
      } catch {
        /* letterSpacing no soportado: se ignora */
      }
      octx.textBaseline = "top";
      // Rojo -> color final según el progreso. Los colores se resuelven
      // en runtime (ver colorTokens.ts): el canvas NO resuelve var() en
      // fillStyle y un color-mix con var() se ignora (negro sólido).
      const [r1, g1, b1] = resolveTokenRgb("--brand-red");
      const [r2, g2, b2] = resolveTokenRgb(finalColorVar);
      const rr = Math.round(r1 + (r2 - r1) * p);
      const gg = Math.round(g1 + (g2 - g1) * p);
      const bb = Math.round(b1 + (b2 - b1) * p);
      octx.fillStyle =
        "#" +
        [rr, gg, bb].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
      const words = (target.textContent || "").trim().split(/\s+/);
      const maxW = ow - 2;
      let x = 1;
      let y = 1;
      const lh = lineHeight / step;
      for (const word of words) {
        const w = octx.measureText(word + " ").width;
        if (x > 1 && x + w > maxW) {
          x = 1;
          y += lh;
        }
        octx.fillText(word, x, y);
        x += w;
      }
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
      canvas.style.opacity = (1 - p).toFixed(3);
    }

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
      drawPixelated(p);
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
      canvas.remove();
    };
  }, [ref, finalColorVar]);
}
