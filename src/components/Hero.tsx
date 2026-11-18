"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./hero.module.css";
import { WordFade } from "../lib/anim";
import { px } from "../lib/paths";
import DevBubble from "./DevBubble";
import HeroBackground from "./HeroBackground";

/** Hero 1:1 — fondo fluido (mesh gradient animado + fluted glass waves),
    título gigante por caracteres, pitch a la derecha y meta abajo. El fade
    del fondo y el parallax del ratón se gobiernan con variables CSS
    (--hero-fade). Título, pitch y meta son celdas de la RETÍCULA
    COMPARTIDA del sitio (.site-grid en globals.css: 12 columnas desktop
    / 4 móvil, gutters 24px / 16px, márgenes = gutter); en móvil el nav
    sale de la grid y las 12 filas empiezan debajo de su barra (56px):
    1-2 hueco, 3-6 título, 7 hueco, 8 rol, 9-10 párrafo, 11 hueco,
    12 meta. La burbuja flotante de herramientas de desarrollo (arrastrable,
    con su posición en localStorage) muestra la retícula para verificar que
    cada elemento cae en su lugar; NO es parte del diseño.
    Idioma (es/en): el Hero escucha el evento "site-lang" del toggle del
    header y cambia título, párrafo y meta. El hero SIEMPRE es oscuro:
    el mesh no cambia de color con el tema (sin velo blanco en light
    mode) y el texto es siempre claro. */
const HERO_TEXT = {
  es: {
    title: [["Diseñando"], ["con", "sentido"], ["humano."]],
    para: "Desafío lo convencional para crear soluciones simples, útiles e intuitivas.",
    meta1Label: ["Portafolio", "de", "trabajo"],
    meta1Value: ["Jafet", "Pérez"],
    meta2Label: ["Contact"],
    meta2Value: ["Conectemos"],
  },
  en: {
    title: [["Designing"], ["with", "human"], ["sense."]],
    para: "Challenging the conventional to build simple, useful, and usable solutions.",
    meta1Label: ["Work", "portfolio"],
    meta1Value: ["Jafet", "Pérez"],
    meta2Label: ["Contact"],
    meta2Value: ["Let's", "connect"],
  },
} as const;
type Lang = keyof typeof HERO_TEXT;

/** Idioma como store externo: el toggle del header dispara "site-lang"
    y el Hero se suscribe. En el servidor es "es" (el idioma por
    defecto); en el cliente lee localStorage. */
function getLang(): Lang {
  if (typeof window === "undefined") return "es";
  return window.localStorage.getItem("site-lang") === "en" ? "en" : "es";
}
function subscribeLang(cb: () => void) {
  window.addEventListener("site-lang", cb);
  return () => window.removeEventListener("site-lang", cb);
}

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const lang = useSyncExternalStore<Lang>(subscribeLang, getLang, () => "es");
  const t = HERO_TEXT[lang];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onScroll = () => {
      const h = root.offsetHeight || window.innerHeight;
      const fade = Math.min(1, Math.max(0, window.scrollY / (h * 0.9)));
      wrapRef.current?.style.setProperty("--hero-fade", String(fade));
    };
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      imgWrapRef.current?.style.setProperty(
        "transform",
        `scale(1.06) translate(${(nx * -1.4).toFixed(2)}%, ${(ny * -1.4).toFixed(2)}%)`
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      root.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section id="hero" className={styles.hero} ref={rootRef}>
      <div className={styles.rippleWrap} data-hero-fade-box="" ref={wrapRef}>
        <div className={styles.rippleFade}>
          <div className={styles.bg} aria-hidden="true">
            <div
              className={styles.imgWrap}
              ref={imgWrapRef}
              style={{ transform: "scale(1.0000) translate(0%, 0%)", filter: "brightness(1.01)" }}
            >
              <div className={styles.bgSource} data-hero-bg-source="" aria-hidden="true">
                <HeroBackground />
              </div>
            </div>
            <div className={styles.veil} style={{ background: "var(--brand-gray-1)", opacity: 0.015 }} />
            <div className={styles.topFade} aria-hidden="true">
              <div className={styles.topFadeLayer} />
            </div>
            <div className={`${styles.topFade} ${styles.bottomDark}`} aria-hidden="true" />
            <div className={styles.panelLines} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={`container site-grid ${styles.inner}`}>
        {showGrid && (
          <div className={`site-grid ${styles.gridOverlay}`} aria-hidden="true">
            {Array.from({ length: 144 }, (_, i) => (
              <div key={i} className={styles.gridOverlayCell} />
            ))}
          </div>
        )}
        <div className={styles.titleWrap} data-hero-focus-box="" data-ripple-target="">
          <h1
            id="hero-title"
            className={`${styles.titleBase} ${styles.title55} clipped`}
            style={{ textShadow: "0px 2px 18px rgb(from var(--brand-black) r g b / 0.32)" }}
          >
            {t.title.map((line, li) => (
              <span className={styles.titleLine} key={li}>
                {line.map((word, wi) => (
                  <span key={wi}>
                    {wi > 0 ? " " : null}
                    <span
                      className={styles.titleWord}
                      style={{ "--word-index": li * 3 + wi } as React.CSSProperties}
                    >
                      {word}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
        </div>

        <div className={styles.pitch}>
          <p className={styles.role}>
            <span>UX/UI · Product Design · Branding</span>
            <svg
              className={styles.roleIcon}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 7l10 10M17 8v9H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
          <p className={styles.sub}>{t.para}</p>
        </div>

        <div className={styles.meta} data-parallax-pitch="">
            <div className={styles.metaItem}>
              <span className={styles.metaLabel} style={{ "--anim-base": "560ms" } as React.CSSProperties}>
                <span className="sr-only">{t.meta1Label.join(" ")}</span>
                <WordFade words={[...t.meta1Label]} base="560ms" />
              </span>
              <span className={styles.metaValue} style={{ "--anim-base": "650ms" } as React.CSSProperties}>
                <span className="sr-only">{t.meta1Value.join(" ")}</span>
                <WordFade words={[...t.meta1Value]} base="650ms" />
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel} style={{ "--anim-base": "560ms" } as React.CSSProperties}>
                <span className="sr-only">{t.meta2Label.join(" ")}</span>
                <WordFade words={[...t.meta2Label]} base="560ms" />
              </span>
              <a
                className={`${styles.metaValue} ${styles.ctaLink}`}
                href={px("/contact")}
                style={{ "--anim-base": "650ms" } as React.CSSProperties}
              >
                <span className="sr-only">{t.meta2Value.join(" ")}</span>
                <WordFade words={[...t.meta2Value]} base="650ms" />
                <svg
                  className={styles.ctaIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 7l10 10M17 8v9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
      </div>

      {/* Burbuja flotante de herramientas de desarrollo (DevBubble.tsx):
          el estado de la retícula vive aquí, la burbuja solo es dueña de
          su UI flotante/arrastrable y su posición. */}
      <DevBubble visible={showGrid} onToggle={() => setShowGrid((v) => !v)} />
    </section>
  );
}
