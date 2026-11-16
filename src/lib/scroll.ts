"use client";

import { useEffect, type RefObject } from "react";

/** Progreso de scroll de una sección (el --p de la referencia).
    p = 0 cuando el top de la sección entra por el tercio inferior del
    viewport, p = 1 cuando el top llega al top del viewport; se mantiene
    en 1 al seguir bajando. Medido en la referencia: secTop 450 → 0.22,
    secTop 200 → 0.70, secTop 0 → 1.0 (viewport 900). */
export function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight;
      const range = vh * (2 / 3);
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (range - top) / range));
      el.style.setProperty("--p", p.toFixed(4));
    };
    const loop = () => {
      update();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [ref]);
}

/** morphTarget de la referencia: objetivo de morph por scroll.
    free (.28) es el valor "libre" antes del commit; commit (px) es el
    punto donde el morph se "compromete" (salta a 1-free y luego a 1).
    Ej: morphTarget(0)=0, (45,.28,90)=.14, (90)=.72, (180)=1. */
export function morphTarget(value: number, free: number, commit: number): number {
  const r = value / commit;
  return r < 1
    ? Math.max(0, r) * free
    : 1 - Math.max(0, Math.min(1, 2 - r)) * free;
}

/** Umbral de asentamiento del lerp (código de la referencia). */
export const SETTLED = 0.0001;

/** Parallax de puntero global (--ptr-x/--ptr-y en :root, de -1 a 1).
    Los elementos con data-ptr-parallax lo consumen vía CSS. */
export function usePointerParallax() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    let hovered: HTMLElement | null = null;
    let raf = 0;
    const state = new Map<
      HTMLElement,
      { x: number; y: number; g: number; g0: number; gTo: number; t0: number }
    >();
    const apply = (el: HTMLElement, x: number, y: number) => {
      el.style.setProperty("--ptr-x", x.toFixed(4));
      el.style.setProperty("--ptr-y", y.toFixed(4));
    };
    const clear = (el: HTMLElement) => {
      el.style.removeProperty("--ptr-x");
      el.style.removeProperty("--ptr-y");
    };
    const setGoal = (el: HTMLElement, goal: number) => {
      const cur = state.get(el);
      if (cur && cur.gTo === goal) return;
      const g = cur ? cur.g : 0;
      state.set(el, { x: cur ? cur.x : 0, y: cur ? cur.y : 0, g, g0: g, gTo: goal, t0: performance.now() });
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = (t: number) => {
      raf = 0;
      let active = false;
      for (const [el, s] of state) {
        const o = Math.min(1, (t - s.t0) / 260);
        const e = 1 - Math.pow(1 - o, 3);
        s.g = s.g0 + (s.gTo - s.g0) * e;
        apply(el, s.x * s.g, s.y * s.g);
        if (o < 1) {
          active = true;
        } else if (s.gTo === 0) {
          state.delete(el);
          clear(el);
        } else {
          s.g = 1;
          s.g0 = 1;
        }
      }
      if (active) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-ptr-parallax]") as HTMLElement | null;
      if (el !== hovered) {
        if (hovered) setGoal(hovered, 0);
        hovered = el;
        if (hovered) setGoal(hovered, 1);
      }
      if (!hovered) return;
      const r = hovered.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const st = state.get(hovered);
      if (st) {
        st.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        st.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (st.g === 1 && !raf) apply(hovered, st.x, st.y);
      }
    };
    const onLeave = () => {
      if (hovered) setGoal(hovered, 0);
      hovered = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      state.forEach((_, el) => clear(el));
      state.clear();
    };
  }, []);
}

/** Tono armed → in → done para párrafos con acentos (Capabilities,
    ProcessSummary): al entrar al viewport transiciona 1.1s a su color
    final y luego queda en "done". */
export function useTone(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-tone", "in");
          window.setTimeout(() => el.setAttribute("data-tone", "done"), 1200);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
export function useReveals() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            (en.target as HTMLElement).setAttribute("data-revealed", "");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Puerta de tema (código exacto de la referencia): límites #work →
    claro y #contact-close → oscuro. Un límite se activa cuando su top
    baja del 55% del viewport y se mantiene activo hasta que sube del
    75% (histéresis). Se revisa en scroll/resize vía rAF. En páginas
    /work/* la base es clara. */
export function useThemeGate(base: "dark" | "light" = "dark") {
  useEffect(() => {
    const boundaries: { selector: string; theme: "dark" | "light" }[] = [
      { selector: "#work", theme: "light" },
      { selector: "#contact-close", theme: "dark" },
    ];
    const active = boundaries.map(() => false);
    const root = document.documentElement;
    let theme = root.dataset.theme === "light" ? "light" : "dark";
    let scheduled = false;
    let raf = 0;
    const check = () => {
      scheduled = false;
      const vh = window.innerHeight || 1;
      let next = base;
      for (let i = 0; i < boundaries.length; i++) {
        const el = document.querySelector(boundaries[i].selector);
        if (!el) {
          active[i] = false;
          continue;
        }
        const top = el.getBoundingClientRect().top;
        active[i] = active[i] ? top < 0.75 * vh : top < 0.55 * vh;
        if (active[i]) next = boundaries[i].theme;
      }
      if (next !== theme) {
        theme = next;
        root.dataset.theme = next;
      }
    };
    const schedule = () => {
      if (!scheduled) {
        scheduled = true;
        raf = requestAnimationFrame(check);
      }
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);
}
