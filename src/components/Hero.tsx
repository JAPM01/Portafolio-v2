"use client";

import { useEffect, useRef } from "react";
import styles from "./hero.module.css";
import { CharRise, WordFade } from "../lib/anim";
import HeroBackground from "./HeroBackground";

/** Hero 1:1 — fondo fluido (mesh gradient animado + fluted glass waves),
    título gigante por caracteres, pitch a la derecha y meta abajo. El fade
    del fondo y el parallax del ratón se gobiernan con variables CSS
    (--hero-fade). */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);

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
        <div className={styles.body} data-hero-focus-box="">
          <div className={styles.titleWrap} data-ripple-target="">
            <h1
              id="hero-title"
              className={`${styles.titleBase} ${styles.title55} clipped`}
              style={{ textShadow: "0px 2px 28px rgba(0, 0, 0, 0.45)" }}
            >
              <span style={{ "--anim-base": "0ms" } as React.CSSProperties}>
                <span className="sr-only">Jafet</span>
                <CharRise word="Jafet" base="0ms" />
              </span>
              <span style={{ "--anim-base": "0ms" } as React.CSSProperties}>
                <span className="sr-only">Pérez</span>
                <CharRise word="Pérez" base="0ms" />
              </span>
            </h1>
          </div>
        </div>

        <div className={styles.meta} data-parallax-pitch="">
            <div className={styles.metaItem}>
              <span className={styles.metaLabel} style={{ "--anim-base": "560ms" } as React.CSSProperties}>
                <span className="sr-only">Availability</span>
                <WordFade words={["Availability"]} base="560ms" />
              </span>
              <span className={styles.metaValue} style={{ "--anim-base": "650ms" } as React.CSSProperties}>
                <span className="sr-only">I&apos;m taking projects, about a week to start.</span>
                <WordFade
                  words={["I'm", "taking", "projects,", "about", "a", "week", "to", "start."]}
                  base="650ms"
                />
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel} style={{ "--anim-base": "560ms" } as React.CSSProperties}>
                <span className="sr-only">Contact</span>
                <WordFade words={["Contact"]} base="560ms" />
              </span>
              <a
                className={styles.metaValue}
                href="mailto:jperez.mond@gmail.com"
                style={{ "--anim-base": "650ms" } as React.CSSProperties}
              >
                <span className="sr-only">jperez.mond@gmail.com</span>
                <WordFade words={["jperez.mond@gmail.com"]} base="650ms" />
              </a>
            </div>
          </div>
      </div>

      <div className={styles.pitch}>
        <p className={styles.role}>
          <span>Lorem ipsum</span>
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
        <p className={styles.sub}>Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.</p>
      </div>
    </section>
  );
}
