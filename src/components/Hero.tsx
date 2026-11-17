"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";
import { CharRise, WordFade } from "../lib/anim";
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
    cada elemento cae en su lugar; NO es parte del diseño. */
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
          <p className={styles.sub}>Desafío lo convencional para crear soluciones simples, útiles e intuitivas.</p>
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
                className={`${styles.metaValue} ${styles.ctaLink}`}
                href={px("/contact")}
                style={{ "--anim-base": "650ms" } as React.CSSProperties}
              >
                <span className="sr-only">Conectemos</span>
                <WordFade words={["Conectemos"]} base="650ms" />
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
