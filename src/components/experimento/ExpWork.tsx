"use client";

import { useEffect, useRef } from "react";
import { EXP_FEATURED, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-work.module.css";

/**
 * Trabajo seleccionado — clon 1:1 TOTAL de Melon (medido en vivo, 19 Nov 2026).
 * Melon: UNA columna; cada artículo es una rejilla de 2 columnas con
 * título/meta a la izquierda (alineados a la derecha, a la altura de la
 * parte superior de la imagen) e imagen a la derecha (~530px de alto).
 * Fondo crema, título gigante en gótica roja con "Show all" a la derecha.
 * Sin "Más proyectos" (Melon no lo tiene en la home).
 *
 * Animación 3D ligada al scroll (la que faltaba, 19 Nov 2026): cada
 * imagen se deforma en 3D (rotateX sobre perspectiva) según su posición
 * en el viewport — nunca es un rectángulo plano al hacer scroll, como
 * en Melon. Se respeta prefers-reduced-motion (sin deformación).
 */
export default function ExpWork() {
  const t = EXP_STRINGS.work;
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const root: HTMLElement = section;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    function update() {
      raf = 0;
      const vpH = window.innerHeight;
      const vpCenter = vpH / 2;
      const medias = root.querySelectorAll<HTMLElement>("." + styles.media);
      medias.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-0.6, Math.min(0.6, (center - vpCenter) / vpH));
        const tilt = progress * 24;
        const bend = 1 - Math.abs(progress) * 0.05;
        el.style.setProperty("--tilt", tilt.toFixed(2) + "deg");
        el.style.setProperty("--bend", bend.toFixed(3));
      });
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
    <section
      className={styles.section}
      id="exp-work"
      aria-labelledby="exp-work-heading"
      ref={sectionRef}
    >
      <div className="site-grid">
        <div className={styles.headRow}>
          <h2 className={"type-h2 " + styles.heading + " " + styles.inkRed} id="exp-work-heading">
            {t.heading}
          </h2>
          <a className={"type-mono " + styles.showAll + " " + styles.ink} href={t.showAllHref}>
            {t.showAll} →
          </a>
        </div>

        <div className={styles.list}>
          {EXP_FEATURED.map((project) => (
            <article className={styles.card} key={project.title}>
              <div className={styles.text}>
                <h3 className={"type-h5 " + styles.title + " " + styles.ink}>{project.title}</h3>
                <p className={"type-mono " + styles.meta + " " + styles.inkMuted}>{project.meta}</p>
              </div>
              <figure className={styles.media}>
                <a href={project.link} target="_blank" rel="noreferrer" aria-label={project.imageAlt}>
                  <img src={project.image} alt={project.imageAlt} loading="lazy" />
                </a>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
