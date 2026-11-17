"use client";

import { useRef, useSyncExternalStore } from "react";
import styles from "./intro.module.css";
import { useSectionProgress } from "../lib/scroll";

/** Manifiesto (texto solo, sin retrato): párrafo grande con reveal por
    letra al hacer scroll. Colores v4 (Jafet 17 Nov 2026): casi todo en
    gris (brand-gray-5), "diseño"/"tecnología" en azul brand (#000AFF) y
    "resultados reales." en blanco. Iconos inline estilo Arshaw (blancos,
    outline): paleta de acuarela 🎨 tras "diseño", </> tras "tecnología"
    y mira tras "resultados reales." El idioma cambia con el toggle del
    header, igual que el Hero (evento "site-lang"). Sin foto, sin
    gradiente y sin mockup: la sección es solo el manifiesto. */

type Tone = "gray" | "blue" | "white";
type IconKind = "palette" | "code" | "target";
type Segment = { text: string; tone: Tone; icon?: IconKind };

const MANIFESTO: Record<"es" | "en", Segment[]> = {
  es: [
    { text: "Me", tone: "gray" },
    { text: "muevo", tone: "gray" },
    { text: "entre", tone: "gray" },
    { text: "el", tone: "gray" },
    { text: "diseño", tone: "blue", icon: "palette" },
    { text: "y", tone: "gray" },
    { text: "la", tone: "gray" },
    { text: "tecnología", tone: "blue", icon: "code" },
    { text: "para", tone: "gray" },
    { text: "abordar", tone: "gray" },
    { text: "cada", tone: "gray" },
    { text: "reto", tone: "gray" },
    { text: "desde", tone: "gray" },
    { text: "la", tone: "gray" },
    { text: "raíz,", tone: "gray" },
    { text: "tomando", tone: "gray" },
    { text: "decisiones", tone: "gray" },
    { text: "claras", tone: "gray" },
    { text: "que", tone: "gray" },
    { text: "se", tone: "gray" },
    { text: "miden", tone: "gray" },
    { text: "por", tone: "gray" },
    { text: "resultados", tone: "white" },
    { text: "reales.", tone: "white", icon: "target" },
  ],
  en: [
    { text: "Moving", tone: "gray" },
    { text: "between", tone: "gray" },
    { text: "design", tone: "blue", icon: "palette" },
    { text: "and", tone: "gray" },
    { text: "technology", tone: "blue", icon: "code" },
    { text: "to", tone: "gray" },
    { text: "tackle", tone: "gray" },
    { text: "every", tone: "gray" },
    { text: "challenge", tone: "gray" },
    { text: "from", tone: "gray" },
    { text: "the", tone: "gray" },
    { text: "root,", tone: "gray" },
    { text: "making", tone: "gray" },
    { text: "clear", tone: "gray" },
    { text: "decisions", tone: "gray" },
    { text: "measured", tone: "gray" },
    { text: "by", tone: "gray" },
    { text: "real", tone: "white" },
    { text: "outcomes.", tone: "white", icon: "target" },
  ],
};
type Lang = keyof typeof MANIFESTO;

/** Iconos inline (outline, blancos, estilo Lucide/MIT): paleta de
    acuarela, código </> y mira. Van en línea con el texto, ~0.8em. */
function InlineIcon({ kind }: { kind: IconKind }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "palette") {
    return (
      <svg {...common}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    );
  }
  if (kind === "code") {
    return (
      <svg {...common}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

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

const TONE_CLASS: Record<Tone, string> = {
  gray: styles.toneGray,
  blue: styles.toneBlue,
  white: styles.toneWhite,
};

export default function Intro() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionProgress(sectionRef);
  const lang = useSyncExternalStore<Lang>(subscribeLang, getLang, () => "es");
  const segments = MANIFESTO[lang];
  // Total de caracteres (sin espacios): el reveal usa --i / --n.
  const n = segments.reduce((acc, s) => acc + Array.from(s.text).length, 0);

  let i = 0;
  const units: React.ReactNode[] = [];
  segments.forEach((seg, w) => {
    const letters = Array.from(seg.text).map((ch) => {
      const idx = i++;
      return (
        <span key={idx} className={styles.letter} style={{ "--i": idx } as React.CSSProperties}>
          {ch}
        </span>
      );
    });
    // El icono se revela junto con la última letra de su palabra
    // (--i = índice de la última letra; usar i, el índice siguiente,
    // lo dejaría en --t = 0 siempre porque i/n = 1 y --p ≤ 1).
    const icon =
      seg.icon != null ? (
        <span
          key={`icon-${w}`}
          className={styles.icon}
          style={{ "--i": i - 1 } as React.CSSProperties}
          aria-hidden="true"
        >
          <InlineIcon kind={seg.icon} />
        </span>
      ) : null;
    units.push(
      <span key={seg.text + i} className={`${styles.word} ${TONE_CLASS[seg.tone]}`} data-unit="">
        {letters}
        {icon}
      </span>
    );
    if (w < segments.length - 1) units.push(" ");
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
