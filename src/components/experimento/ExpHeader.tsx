"use client";

import { useState } from "react";
import { useExpLang } from "../../lib/exp-content";
import styles from "./exp-header.module.css";

/**
 * Header del experimento — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: barra superior plana (sin píldora), logotipo a la izquierda,
 * navegación a la derecha, ~90px de alto. Aquí el logotipo es "JPM" en
 * texto y la navegación son las secciones de la v2 + idioma. Es
 * position: absolute (se va con el scroll) para no chocar con las
 * secciones claras; el header de Tom viene después del clon exacto.
 */
const NAV = [
  { id: "exp-work", es: "Trabajo", en: "Work" },
  { id: "exp-manifesto", es: "Manifiesto", en: "Manifesto" },
  { id: "exp-experience", es: "Experiencia", en: "Experience" },
  { id: "exp-clients", es: "Clientes", en: "Clients" },
  { id: "exp-close", es: "Contacto", en: "Contact" },
] as const;

export default function ExpHeader() {
  const lang = useExpLang();
  const [open, setOpen] = useState(false);

  const toggleLang = () => {
    const next = lang === "es" ? "en" : "es";
    document.documentElement.lang = next;
    try {
      localStorage.setItem("site-lang", next);
    } catch {
      // La lengua cambia aunque no persista.
    }
    window.dispatchEvent(new CustomEvent("site-lang", { detail: next }));
  };

  return (
    <>
      <header className={styles.header}>
        <a className={styles.logo} href="#exp-hero">
          JPM
        </a>
        <nav className={styles.nav} aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}>
          {NAV.map((item) => (
            <a className="type-mono" key={item.id} href={`#${item.id}`}>
              {item[lang]}
            </a>
          ))}
          <button
            className={"type-mono " + styles.lang}
            type="button"
            onClick={toggleLang}
            aria-label={lang === "es" ? "Cambiar idioma a inglés" : "Switch language to Spanish"}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <button
            className={"type-mono " + styles.menu}
            type="button"
            onClick={() => setOpen(true)}
            aria-label={lang === "es" ? "Abrir menú" : "Open menu"}
          >
            {lang === "es" ? "Menú" : "Menu"}
          </button>
        </nav>
      </header>

      {open ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <button
            className={"type-mono " + styles.close}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={lang === "es" ? "Cerrar menú" : "Close menu"}
          >
            {lang === "es" ? "Cerrar ✕" : "Close ✕"}
          </button>
          <nav className={styles.overlayNav} aria-label={lang === "es" ? "Menú" : "Menu"}>
            <a className="type-h3" href="/" onClick={() => setOpen(false)}>
              {lang === "es" ? "Inicio" : "Home"}
            </a>
            {NAV.map((item) => (
              <a
                className="type-h3"
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
              >
                {item[lang]}
              </a>
            ))}
            <a className="type-h3" href="/contact" onClick={() => setOpen(false)}>
              {lang === "es" ? "Contacto" : "Contact"}
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
