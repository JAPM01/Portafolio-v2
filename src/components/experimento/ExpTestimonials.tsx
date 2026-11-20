"use client";

import { useRef, useState } from "react";
import { EXP_STRINGS, EXP_TESTIMONIALS } from "../../lib/exp-content";
import styles from "./exp-testimonials.module.css";
import { useLiquidReveal } from "./useLiquidReveal";

/**
 * Testimonios — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: "What people say" (sin etiqueta), cita a la IZQUIERDA en
 * columna con comilla gigante, atribución con guion + nombre + cargo
 * y empresa en líneas separadas, enlace "case study" en la primera, y
 * paginación ← 01/03 → abajo a la izquierda. El bloque rojo se oscurece
 * abajo (fade a negro). El cambio de cita tiene transición de entrada.
 */
export default function ExpTestimonials() {
  const t = EXP_STRINGS.testimonials;
  const [index, setIndex] = useState(0);
  const total = EXP_TESTIMONIALS.length;
  const item = EXP_TESTIMONIALS[index];
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useLiquidReveal(headingRef);

  function prev() {
    setIndex((i) => (i - 1 + total) % total);
  }

  function next() {
    setIndex((i) => (i + 1) % total);
  }

  return (
    <section className={styles.section} id="exp-testimonials" aria-labelledby="exp-testimonials-heading">
      <div className={styles.fade} aria-hidden="true" />
      <div className={"site-grid " + styles.content}>
        <h2 className={"type-h2 " + styles.heading} id="exp-testimonials-heading" ref={headingRef}>
          {t.heading}
        </h2>

        <div className={styles.box}>
          <span className={styles.mark} aria-hidden="true">
            <span className={styles.markIn}>“</span>
          </span>
          <figure className={styles.item} key={index}>
            <blockquote className={"type-h3 " + styles.text}>{item.quote}</blockquote>
            <figcaption className={styles.who}>
              <span className={styles.dash} aria-hidden="true" />
              <span className={"type-body " + styles.name}>{item.name}</span>
              <span className={"type-body " + styles.role}>{item.role}</span>
            </figcaption>
            {item.caseStudy ? (
              <p className={styles.case}>
                <a className={styles.caseLink} href={item.caseStudy} target="_blank" rel="noreferrer">
                  {item.caseStudyLabel} ↗
                </a>
              </p>
            ) : null}
          </figure>
          <div className={styles.controls}>
            <button type="button" className={styles.ctrlBtn} onClick={prev} aria-label={t.prev}>
              ←
            </button>
            <span className="type-mono">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <button type="button" className={styles.ctrlBtn} onClick={next} aria-label={t.next}>
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
