"use client";

import { useState } from "react";
import { EXP_STRINGS, EXP_TESTIMONIALS, useExpLang } from "../../lib/exp-content";
import styles from "./exp-testimonials.module.css";

/**
 * Testimonios — versión experimento.
 * Referencia: Melon (bloque + cita grande ~48-54px, comilla gigante,
 * controles circulares de 48px + paginación 01/03).
 * Las 3 citas son BORRADORES redactados a petición de Jafet (19 Nov 2026):
 * él recibió buenos comentarios pero no los tiene por escrito. Basadas en
 * hechos reales de cada proyecto, atribuidas al equipo (sin inventar
 * nombres de personas ni métricas). Jafet las confirma o reemplaza.
 * El cambio de cita es un switch de contenido sin animación.
 */
export default function ExpTestimonials() {
  const lang = useExpLang();
  const t = EXP_STRINGS.testimonials;
  const [index, setIndex] = useState(0);
  const total = EXP_TESTIMONIALS.length;
  const item = EXP_TESTIMONIALS[index];

  function prev() {
    setIndex((i) => (i - 1 + total) % total);
  }

  function next() {
    setIndex((i) => (i + 1) % total);
  }

  return (
    <section className={styles.section} id="exp-testimonials" aria-labelledby="exp-testimonials-heading">
      <div className="site-grid">
        <p className={"type-mono " + styles.label}>{t.label[lang]}</p>
        <h2 className={"type-h2 " + styles.heading} id="exp-testimonials-heading">
          {t.heading[lang]}
        </h2>

        <blockquote className={styles.quote}>
          <span className={styles.mark} aria-hidden="true">“</span>
          <p className={"type-h3 " + styles.text}>{item.quote[lang]}</p>
          <footer className={styles.foot}>
            <span className="type-body">— {item.by[lang]}</span>
            {item.link ? (
              <a className={styles.caseLink} href={item.link} target="_blank" rel="noreferrer">
                {item.linkLabel?.[lang]} ↗
              </a>
            ) : null}
          </footer>
          <div className={styles.controls}>
            <button type="button" className={styles.ctrlBtn} onClick={prev} aria-label={t.prev[lang]}>
              ←
            </button>
            <span className="type-mono">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button type="button" className={styles.ctrlBtn} onClick={next} aria-label={t.next[lang]}>
              →
            </button>
          </div>
        </blockquote>
      </div>
    </section>
  );
}
