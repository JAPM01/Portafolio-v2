"use client";

import { useState } from "react";
import { EXP_LOGO, MELON_BASE } from "../../lib/exp-content";
import styles from "./exp-header.module.css";

/**
 * Header del experimento — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: barra superior plana (sin píldora), logotipo SVG a la izquierda,
 * navegación a la derecha: work (7), articles (7), about, contact.
 * Sin toggle de idioma (Melon es solo inglés). Position absolute: se va
 * con el scroll. En móvil, botón Menú con overlay.
 */
const NAV = [
  { id: "exp-work", label: "work", count: 7 },
  { id: "exp-insights", label: "articles", count: 7 },
  { id: "exp-manifesto", label: "about", count: null },
  { id: "exp-contact", label: "contact", count: null },
] as const;

export default function ExpHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
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
