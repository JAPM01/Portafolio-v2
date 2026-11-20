"use client";

import { useEffect, useRef } from "react";
import { EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-manifesto.module.css";

/**
 * Manifiesto — clon 1:1 TOTAL de Melon About (medido en vivo, 19 Nov 2026).
 * Melon: statement gigante a todo lo ancho EN ROJO con el retrato circular
 * sobre disco rojo incrustado tras "Piotr", y debajo dos párrafos en dos
 * columnas + enlace "More about me". Sin etiqueta visible (el h2 "About
 * me" de Melon es solo para lectores de pantalla).
 *
 * Animación ligada al scroll (la que faltaba, 19 Nov 2026): el statement
 * se desenfoca progresivamente al hacer scroll (blur según la posición
 * en el viewport), como en Melon. Se respeta prefers-reduced-motion.
 */
export default function ExpManifesto() {
  const t = EXP_STRINGS.about;
  const statementRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = statementRef.current;
    if (!el) return;
    const target: HTMLParagraphElement = el;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    function update() {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const vpCenter = window.innerHeight / 2;
      // El blur crece cuando el statement sube por encima del centro.
      const progress = Math.max(0, Math.min(1, (vpCenter - center) / window.innerHeight));
      const blur = progress * 10;
      target.style.setProperty("--blur", blur.toFixed(2) + "px");
    }
    function onScroll() {
      if (!raf) raf = window.requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className={styles.section} id="exp-manifesto" aria-labelledby="exp-manifesto-heading">
      <div className="site-grid">
        <h2 className="sr-only" id="exp-manifesto-heading">
          About me
        </h2>
        <p
          className={"type-h2 " + styles.statement + " " + styles.inkRed}
          ref={statementRef}
        >
          {t.statementBefore}
          <span className={styles.disc} aria-hidden="true">
            <img src={t.portrait} alt="" loading="lazy" />
          </span>{" "}
          {t.statementAfter}
        </p>

        <div className={styles.body}>
          <p className={"type-body " + styles.ink}>{t.paragraphs[0]}</p>
        </div>
        <div className={styles.body + " " + styles.bodySecond}>
          <p className={"type-body " + styles.ink}>{t.paragraphs[1]}</p>
          <p className={"type-body " + styles.inkMuted}>
            <a className={styles.moreLink} href={t.moreAboutHref} target="_blank" rel="noreferrer">
              {t.moreAbout} ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
