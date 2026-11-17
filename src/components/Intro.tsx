"use client";

import { useRef, useSyncExternalStore } from "react";
import styles from "./intro.module.css";
import { useSectionProgress } from "../lib/scroll";

/** Manifiesto (texto solo, sin retrato): párrafo grande con reveal por
    letra al hacer scroll (color gris → blanco). El texto es el manifiesto
    de Jafet (ES/EN); el idioma cambia con el toggle del header, igual
    que el Hero (evento "site-lang"). Sin foto, sin gradiente y sin
    mockup: la sección es solo el manifiesto a todo lo ancho. */

const MANIFESTO = {
  es: [
    "Me",
    "muevo",
    "entre",
    "el",
    "diseño",
    "y",
    "la",
    "tecnología",
    "para",
    "abordar",
    "cada",
    "reto",
    "desde",
    "la",
    "raíz,",
    "tomando",
    "decisiones",
    "claras",
    "que",
    "se",
    "miden",
    "por",
    "resultados",
    "reales.",
  ],
  en: [
    "Moving",
    "between",
    "design",
    "and",
    "technology",
    "to",
    "tackle",
    "every",
    "challenge",
    "from",
    "the",
    "root,",
    "making",
    "clear",
    "decisions",
    "measured",
    "by",
    "real",
    "outcomes.",
  ],
} as const;
type Lang = keyof typeof MANIFESTO;

/** Idioma como store externo (mismo patrón que el Hero): el toggle del
    header dispara "site-lang" y el Manifiesto se suscribe. En el servidor
    es "es" (el idioma por defecto); en el cliente lee localStorage. */
function getLang(): Lang {
  if (typeof window === "undefined") return "es";
  return window.localStorage.getItem("site-lang") === "en" ? "en" : "es";
}
function subscribeLang(cb: () => void) {
  window.addEventListener("site-lang", cb);
  return () => window.removeEventListener("site-lang", cb);
}

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionProgress(sectionRef);
  const lang = useSyncExternalStore<Lang>(subscribeLang, getLang, () => "es");
  const words = MANIFESTO[lang];
  // Total de caracteres (sin espacios): el reveal usa --i / --n.
  const n = words.reduce((acc, w) => acc + Array.from(w).length, 0);

  let i = 0;
  const units: React.ReactNode[] = [];
  words.forEach((word, w) => {
    const letters = Array.from(word).map((ch) => {
      const idx = i++;
      return (
        <span key={idx} className={styles.letter} style={{ "--i": idx } as React.CSSProperties}>
          {ch}
        </span>
      );
    });
    units.push(
      <span key={word + i} className={styles.word} data-unit="">
        {letters}
      </span>
    );
    if (w < words.length - 1) units.push(" ");
  });

  return (
    <section id="intro" className={styles.section} aria-label="Manifesto" ref={sectionRef}>
      <div className={`container ${styles.grid}`} data-scroll-highlight="">
        <p className={styles.copy} data-intro-copy="" style={{ "--n": n } as React.CSSProperties}>
          {units}
        </p>
      </div>
    </section>
  );
}
