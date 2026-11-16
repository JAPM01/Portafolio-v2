"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";
import { CharRise, WordFade } from "../lib/anim";
import { px } from "../lib/paths";
import HeroBackground from "./HeroBackground";

/** Hero 1:1 — fondo fluido (mesh gradient animado + fluted glass waves),
    título gigante por caracteres, pitch a la derecha y meta abajo. El fade
    del fondo y el parallax del ratón se gobiernan con variables CSS
    (--hero-fade). Título, pitch y meta son celdas de UNA retícula
    (12×12 desktop, 4×12 móvil, base 8): el botón flotante muestra la
    retícula para verificar que cada elemento cae en su lugar. */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(true);

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
            <div className={styles.veil} style={{ background: "#080405", opacity: 0.2 }} />
            <div className={styles.topFade} aria-hidden="true">
              <div className={styles.topFadeLayer} />
            </div>
            <div className={`${styles.topFade} ${styles.bottomDark}`} aria-hidden="true" />
            <div className={styles.panelLines} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className={`container ${styles.inner}`}>
        {showGrid && (
          <div className={styles.gridOverlay} aria-hidden="true">
            {Array.from({ length: 144 }, (_, i) => (
              <div key={i} className={styles.gridOverlayCell} />
            ))}
          </div>
        )}
        <div className={styles.titleWrap} data-hero-focus-box="" data-ripple-target="">
          <h1
            id="hero-title"
            className={`${styles.titleBase} ${styles.title55} clipped`}
            style={{ textShadow: "0px 2px 28px rgba(0, 0, 0, 0.45)" }}
          >
            <span style={{ "--anim-base": "0ms" } as React.CSSProperties}>
              <span className="sr-only">Diseñando</span>
              <CharRise word="Diseñando" base="0ms" />
            </span>
            <span style={{ "--anim-base": "0ms" } as React.CSSProperties}>
              <span className="sr-only">con sentido</span>
              <CharRise word="con" base="0ms" />{" "}
              <CharRise word="sentido" base="0ms" />
            </span>
            <span style={{ "--anim-base": "0ms" } as React.CSSProperties}>
              <span className="sr-only">humano.</span>
              <CharRise word="humano." base="0ms" />
            </span>
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
          <p className={styles.sub}>Cuestiono lo habitual para crear soluciones con enfoque humano.</p>
        </div>

        <div className={styles.meta} data-parallax-pitch="">
            <div className={styles.metaItem}>
              <span className={styles.metaLabel} style={{ "--anim-base": "560ms" } as React.CSSProperties}>
                <span className="sr-only">Portafolio de trabajo</span>
                <WordFade words={["Portafolio", "de", "trabajo"]} base="560ms" />
              </span>
              <span className={styles.metaValue} style={{ "--anim-base": "650ms" } as React.CSSProperties}>
                <span className="sr-only">Jafet Pérez</span>
                <WordFade words={["Jafet", "Pérez"]} base="650ms" />
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel} style={{ "--anim-base": "560ms" } as React.CSSProperties}>
                <span className="sr-only">Contact</span>
                <WordFade words={["Contact"]} base="560ms" />
              </span>
              <a
                className={`${styles.metaValue} ${styles.ctaButton}`}
                href={px("/contact")}
                style={{ "--anim-base": "650ms" } as React.CSSProperties}
              >
                <span className="sr-only">Conectemos</span>
                <WordFade words={["Conectemos"]} base="650ms" />
              </a>
            </div>
          </div>
      </div>

      <button
        type="button"
        className={styles.gridToggle}
        aria-pressed={showGrid}
        onClick={() => setShowGrid((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        {showGrid ? "Ocultar retícula" : "Ver retícula"}
      </button>
    </section>
  );
}
