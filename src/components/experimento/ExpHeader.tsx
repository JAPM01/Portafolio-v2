"use client";

import { useEffect, useRef } from "react";
import { EXP_LOGO } from "../../lib/exp-content";
import styles from "./exp-header.module.css";

/**
 * Header del experimento — clon 1:1 de Melon (CSS capturado, 19 Nov 2026):
 * .topbar fixed, top 22, left/right gutter, z 10, flex space-between,
 * align flex-start. Logo 110×50. Nav: gap 50, padding-top 13, 18px/400/1,
 * LS -.01em, enlaces /work /insights /about /contact. Sup del nav:
 * 10px, opacity .6, margin-left 4px, top -.85em, mono 500.
 * Móvil: SIN botón Menu (nav visible 15px, gap 18, top 16, logo 77×35,
 * count oculto). Melon se esconde al bajar (top −74 a 900px de scroll)
 * y vuelve al subir; aquí translateY −120% con el mismo trigger.
 * Color por sección (data-tone): negro sobre rojo/crema, blanco sobre
 * negro. Melon usa mix-blend-mode: difference + velo .f-solid; el tono
 * por sección es la aproximación equivalente sin velo.
 */
const NAV = [
  { label: "work", href: "/work", count: 7 },
  { label: "articles", href: "/insights", count: 7 },
  { label: "about", href: "/about", count: null },
  { label: "contact", href: "/contact", count: null },
] as const;

// Tono del header según la sección que tiene debajo (negro sobre
// rojo/crema, blanco sobre negro).
const TONE: Record<string, "light" | "dark"> = {
  "exp-hero": "light",
  "exp-work": "light",
  "exp-manifesto": "light",
  "exp-experience": "dark",
  "exp-insights": "light",
  "exp-clients": "dark",
  "exp-testimonials": "light",
  "exp-contact": "dark",
  "exp-footer": "dark",
};

export default function ExpHeader() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const target: HTMLElement = header;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let lastY = window.scrollY;

    function update() {
      raf = 0;
      const y = window.scrollY;
      // Ocultar al bajar, mostrar al subir.
      if (y > lastY && y > 120) {
        target.classList.add(styles.hidden);
      } else if (y < lastY) {
        target.classList.remove(styles.hidden);
      }
      lastY = y;
      // Tono según la sección bajo el header (y=60).
      const probe = 60;
      const sections = ["exp-hero", "exp-work", "exp-manifesto", "exp-experience", "exp-insights", "exp-clients", "exp-testimonials", "exp-contact", "exp-footer"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          target.dataset.tone = TONE[id] ?? "light";
          break;
        }
      }
    }

    function onScroll() {
      if (!raf) raf = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className={styles.header} ref={headerRef} data-tone="light">
      <a className={styles.logo} href="#exp-hero" aria-label="melon studio, back to top">
        <img src={EXP_LOGO} alt="melon studio" width={110} height={50} />
      </a>
      <nav className={styles.nav} aria-label="Main">
        {NAV.map((item) => (
          <a className="type-mono" key={item.label} href={item.href}>
            {item.label}
            {item.count ? <sup className={styles.count}>({item.count})</sup> : null}
          </a>
        ))}
      </nav>
    </header>
  );
}
