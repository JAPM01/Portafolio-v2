"use client";

import { useEffect, useRef, useState } from "react";
import { EXP_LOGO, MELON_BASE } from "../../lib/exp-content";
import styles from "./exp-header.module.css";

/**
 * Header del experimento — clon 1:1 de Melon, motion sección por sección
 * (estudio visual en navegador, 19 Nov 2026):
 * Melon: barra superior plana (sin píldora), logotipo SVG a la izquierda,
 * navegación a la derecha: work (7), articles (7), about, contact.
 * Sin toggle de idioma. Es FIXED: se desliza hacia arriba fuera de la
 * vista al bajar (translateY −100%) y vuelve al subir; no vuelve solo.
 * Su color se adapta al fondo: negro sobre hero rojo y crema, blanco
 * sobre negro (Experience, Clients, Contacto, Footer). Entrada animada
 * del logo y el nav al cargar. En móvil, botón Menú con overlay.
 */
const NAV = [
  { id: "exp-work", label: "work", count: 7 },
  { id: "exp-insights", label: "articles", count: 7 },
  { id: "exp-manifesto", label: "about", count: null },
  { id: "exp-contact", label: "contact", count: null },
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
  const [open, setOpen] = useState(false);
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
    <>
      <header className={styles.header} ref={headerRef} data-tone="light">
        <a className={styles.logo} href="#exp-hero" aria-label="melon studio, back to top">
          <img src={EXP_LOGO} alt="melon studio" width={110} height={50} />
        </a>
        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => (
            <a className="type-mono" key={item.id} href={`#${item.id}`}>
              {item.label}
              {item.count ? <sup className={styles.count}>({item.count})</sup> : null}
            </a>
          ))}
          <button
            className={"type-mono " + styles.menu}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
        </nav>
      </header>

      {open ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <button
            className={"type-mono " + styles.close}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            Close ✕
          </button>
          <nav className={styles.overlayNav} aria-label="Menu">
            <a className="type-h3" href={MELON_BASE} onClick={() => setOpen(false)}>
              Home
            </a>
            {NAV.map((item) => (
              <a
                className="type-h3"
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
                {item.count ? ` (${item.count})` : ""}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
