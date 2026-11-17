"use client";

import { useRef, useSyncExternalStore } from "react";
import { useSectionProgress } from "../lib/scroll";
import VennFlow from "./VennFlow";
import styles from "./intro.module.css";

type Lang = "es" | "en";
type Tone = "gray" | "blue" | "white";
type Word = { text: string; tone: Tone };

const MANIFESTO: Record<Lang, Word[]> = {
  es: [
    "Me", "muevo", "entre", "el", "diseño,", "la", "tecnología",
    "y", "la", "usabilidad", "para", "abordar", "cada", "reto",
    "desde", "la", "raíz,", "tomando", "decisiones", "claras",
    "que", "se", "miden", "por", "resultados", "reales.",
  ].map((text) => ({
    text,
    tone: text === "diseño," || text === "tecnología" || text === "usabilidad"
      ? "blue"
      : text === "resultados" || text === "reales."
        ? "white"
        : "gray",
  })),
  en: [
    "Moving", "between", "design,", "technology,", "and", "usability",
    "to", "tackle", "every", "challenge", "from", "the", "root,",
    "making", "clear", "decisions", "measured", "by", "real",
    "outcomes.",
  ].map((text) => ({
    text,
    tone: text === "design," || text === "technology," || text === "usability"
      ? "blue"
      : text === "real" || text === "outcomes."
        ? "white"
        : "gray",
  })),
};

const CONTENT = {
  es: {
    eyebrow: "SOBRE MI MÉTODO",
    heading: "01. Mi filosofía",
    thoughts: [
      "Entender a las personas.",
      "Observar antes de actuar.",
      "Definir los resultados.",
    ],
  },
  en: {
    eyebrow: "ABOUT MY METHOD",
    heading: "01. My philosophy",
    thoughts: [
      "Understanding people.",
      "Observing before acting.",
      "Defining outcomes.",
    ],
  },
} as const;

const TONE_CLASS: Record<Tone, string> = {
  gray: styles.toneGray,
  blue: styles.toneBlue,
  white: styles.toneWhite,
};

function getLang(): Lang {
  if (typeof window === "undefined") return "es";
  return window.localStorage.getItem("site-lang") === "en" ? "en" : "es";
}

function subscribeLang(callback: () => void) {
  window.addEventListener("site-lang", callback);
  return () => window.removeEventListener("site-lang", callback);
}

/** Sección inmediatamente posterior al hero, usando la retícula global
 *  12/4 columnas, el sistema tipográfico y los temas existentes.
 *  Conserva íntegro el texto aprobado del manifiesto y su reveal.
 */
export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionProgress(sectionRef);
  const lang = useSyncExternalStore<Lang>(subscribeLang, getLang, () => "es");
  const t = CONTENT[lang];
  const words = MANIFESTO[lang];
  const total = words.reduce((sum, word) => sum + Array.from(word.text).length, 0);

  let index = 0;
  const units: React.ReactNode[] = [];
  words.forEach((word, wordIndex) => {
    const letters = Array.from(word.text).map((character) => {
      const current = index++;
      return (
        <span
          key={current}
          className={styles.letter}
          style={{ "--i": current } as React.CSSProperties}
        >
          {character}
        </span>
      );
    });
    units.push(
      <span key={`${wordIndex}-${word.text}`} className={`${styles.word} ${TONE_CLASS[word.tone]}`}>
        {letters}
      </span>
    );
    if (wordIndex < words.length - 1) units.push(" ");
  });

  return (
    <section
      id="intro"
      className={styles.section}
      aria-labelledby="intro-heading"
      ref={sectionRef}
    >
      <div className={`container site-grid ${styles.layout}`}>
        <div className={styles.headingBlock}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <h2 className="type-h2" id="intro-heading">{t.heading}</h2>
        </div>

        {/* Orden en el DOM: manifiesto → bullets → diagrama (así apila
            en móvil). En desktop la retícula coloca el diagrama en el
            centro y los bullets a la derecha con grid-column. */}
        <div className={styles.copyColumn} data-scroll-highlight="">
          <p
            className={styles.copy}
            data-intro-copy=""
            style={{ "--n": total } as React.CSSProperties}
          >
            {units}
          </p>
        </div>

        <div className={styles.editorial}>
          <div className={styles.thoughts}>
            {t.thoughts.map((thought) => (
              <p className={styles.thought} key={thought}>{thought}</p>
            ))}
          </div>
        </div>

        <div className={styles.diagram}>
          <VennFlow lang={lang} />
        </div>
      </div>
    </section>
  );
}
