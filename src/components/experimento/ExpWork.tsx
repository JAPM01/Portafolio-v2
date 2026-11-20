"use client";

import { useEffect, useRef } from "react";
import { EXP_FEATURED, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-work.module.css";
import { useLiquidReveal } from "./useLiquidReveal";
import WarpImage, { type WarpHandle } from "./ExpWarpImage";

/**
 * Trabajo seleccionado — clon 1:1 TOTAL de Melon, motion sección por
 * sección (revisión técnica con dev tools / scraping / DOM + estudio
 * visual en navegador, 19 Nov 2026):
 * - Título "Latest Work" con reveal liquid ligado al scroll (blur 40px
 *   → 0, de "top bottom" a "top 40%").
 * - "Show all" con texto que rueda (dos copias) + flechas que entran.
 * - Tarjetas deformadas como la cinta WebGL de Melon: canvas 2D con la
 *   misma matemática de la hoja (sheetShape), torsión diagonal y
 *   oscurecimiento al salir por arriba; el punto de máxima curvatura
 *   viaja con el scroll. Nunca es un rectángulo plano.
 * - Caption (título/meta) que sigue al cursor al pasar sobre la tarjeta
 *   (Melon: .proj__cap fixed + will-change transform).
 * Se respeta prefers-reduced-motion (sin deformación ni reveals).
 */
export default function ExpWork() {
  const t = EXP_STRINGS.work;
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const warpRefs = useRef<(WarpHandle | null)[]>([]);
  useLiquidReveal(headingRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const root: HTMLElement = section;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    function update() {
      raf = 0;
      if (reduced) return;
      const vpH = window.innerHeight;
      const vpCenter = vpH / 2;
      const cards = root.querySelectorAll<HTMLElement>("." + styles.card);
      cards.forEach((card, i) => {
        const media = card.querySelector<HTMLElement>("." + styles.media);
        if (!media) return;
        const rect = media.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-0.6, Math.min(0.6, (center - vpCenter) / vpH));
        warpRefs.current[i]?.draw(progress);
        // El título se apaga al salir por arriba (Melon).
        const text = card.querySelector<HTMLElement>("." + styles.text);
        if (text && !text.classList.contains(styles.follow)) {
          const fade = Math.max(0, Math.min(1, 1 + progress / 0.6));
          text.style.opacity = fade.toFixed(2);
        }
      });
    }

    function onScroll() {
      if (!raf) raf = window.requestAnimationFrame(update);
    }

    // Redibujar cuando las imágenes cargan (el canvas necesita la img).
    const timer = window.setTimeout(update, 600);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Caption que sigue al cursor sobre la tarjeta.
  function onCardMouseMove(e: React.MouseEvent<HTMLElement>) {
    const card = e.currentTarget;
    const text = card.querySelector<HTMLElement>("." + styles.text);
    if (!text) return;
    text.classList.add(styles.follow);
    text.style.setProperty("--cx", e.clientX + "px");
    text.style.setProperty("--cy", e.clientY + "px");
  }
  function onCardMouseLeave(e: React.MouseEvent<HTMLElement>) {
    const card = e.currentTarget;
    const text = card.querySelector<HTMLElement>("." + styles.text);
    if (!text) return;
    text.classList.remove(styles.follow);
    text.style.removeProperty("--cx");
    text.style.removeProperty("--cy");
    text.style.opacity = "";
  }

  return (
    <section
      className={styles.section}
      id="exp-work"
      aria-labelledby="exp-work-heading"
      ref={sectionRef}
    >
      <div className="site-grid">
        <div className={styles.headRow}>
          <h2
            className={"type-h2 " + styles.heading + " " + styles.inkRed}
            id="exp-work-heading"
            ref={headingRef}
          >
            {t.heading}
          </h2>
          <a className={"type-mono " + styles.showAll + " " + styles.ink} href={t.showAllHref}>
            <span className={styles.roll}>
              <span className={styles.rollIn}>
                <span className={styles.rollT}>{t.showAll}</span>
                <span className={styles.rollT} aria-hidden="true">
                  {t.showAll}
                </span>
              </span>
            </span>
            <span className={styles.arrs} aria-hidden="true">
              <span className={styles.arr}>→</span>
              <span className={styles.arr} aria-hidden="true">
                →
              </span>
            </span>
          </a>
        </div>

        <div className={styles.list}>
          {EXP_FEATURED.map((project, i) => (
            <article
              className={styles.card}
              key={project.title}
              onMouseMove={onCardMouseMove}
              onMouseLeave={onCardMouseLeave}
            >
              <div className={styles.text}>
                <h3 className={"type-h5 " + styles.title + " " + styles.ink}>{project.title}</h3>
                <p className={"type-mono " + styles.meta + " " + styles.inkMuted}>{project.meta}</p>
              </div>
              <figure className={styles.media}>
                <a href={project.link} target="_blank" rel="noreferrer" aria-label={project.imageAlt}>
                  <WarpImage
                    ref={(h) => {
                      warpRefs.current[i] = h;
                    }}
                    src={project.image}
                    alt={project.imageAlt}
                    className={styles.warp}
                  />
                </a>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
