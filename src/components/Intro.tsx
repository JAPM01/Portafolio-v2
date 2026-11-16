"use client";

import { useRef } from "react";
import { px } from "../lib/paths";
import styles from "./intro.module.css";
import { useSectionProgress, usePointerParallax, useReveals } from "../lib/scroll";

/** Introduction 1:1 — retrato cuadrado con parallax + párrafo grande
    con reveal por letra al hacer scroll (color gris → blanco) e iconos
    inline (globo, </>, pin) que crecen con el mismo progreso. */

const WORDS = [
  "Lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
];

// Iconos inline (SVG exactos de la referencia) tras estas palabras.
const ICONS: Record<string, { at: number; svg: React.ReactNode }> = {
  consectetur: {
    at: 32,
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M21 15H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M21 9H3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    ),
  },
  enim: {
    at: 105,
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path d="M17 8L18.8398 9.85008C19.6133 10.6279 20 11.0168 20 11.5C20 11.9832 19.6133 12.3721 18.8398 13.1499L17 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7 8L5.16019 9.85008C4.38673 10.6279 4 11.0168 4 11.5C4 11.9832 4.38673 12.3721 5.16019 13.1499L7 15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M14.5 4L9.5 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    ),
  },
  "exercitation": {
    at: 141,
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path d="M13.6177 21.367C13.1841 21.773 12.6044 22 12.0011 22C11.3978 22 10.8182 21.773 10.3845 21.367C6.41302 17.626 1.09076 13.4469 3.68627 7.37966C5.08963 4.09916 8.45834 2 12.0011 2C15.5439 2 18.9126 4.09916 20.316 7.37966C22.9082 13.4393 17.599 17.6389 13.6177 21.367Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15.5 11C15.5 12.933 13.933 14.5 12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
};

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionProgress(sectionRef);
  usePointerParallax();
  useReveals();

  let i = 0;
  const units: React.ReactNode[] = [];
  WORDS.forEach((word, w) => {
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
    const icon = ICONS[word];
    if (icon) {
      units.push(
        <span key={"icon-" + icon.at} className={styles.icon} data-icon="" style={{ "--at": icon.at } as React.CSSProperties} aria-hidden="true">
          {icon.svg}
        </span>
      );
    }
    if (w < WORDS.length - 1) units.push(" ");
  });

  return (
    <section id="intro" className={styles.section} aria-label="Introduction" ref={sectionRef}>
      <div className={`container ${styles.grid}`} data-scroll-highlight="">
        <div className={styles.card} data-ptr-parallax="" data-reveal="tl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.photo}
            alt="Jafet Pérez"
            loading="lazy"
            width={877}
            height={877}
            decoding="async"
            src={px("/placeholder.svg")}
          />
        </div>
        <p className={styles.copy} data-intro-copy="" style={{ "--n": 142 } as React.CSSProperties}>
          {units}
        </p>
      </div>
    </section>
  );
}
