"use client";

import { useRef, useState } from "react";
import { EXP_STRINGS, EXP_TESTIMONIALS } from "../../lib/exp-content";
import styles from "./exp-testimonials.module.css";
import { useLiquidReveal } from "./useLiquidReveal";

/**
 * Testimonios — clon 1:1 de Melon (CSS capturado, 19 Nov 2026):
 * .f-rv padding 19vh 0 10.5vh (móvil 13.5/7.5vh); título 300
 * clamp(4rem, 12vw, 11rem)/.86 = 176px (móvil 58.5px); box grid 4/−1,
 * max-width 58rem, margin-top 7vh; cita --f-rv-q clamp(1.6rem, 2.9vw,
 * 3.25rem) = 52px (móvil 25.6px), --f-rv-m = q×4 = 208px; marca
 * .f-rv__mark absolute (top q×.257 − m×.03, right 100% + q×.34 − m×.05,
 * height m×.297, font 300 m/1; móvil relative, margin 0 0 q×.3 m×−.07).
 * Las 3 citas están en el HTML apiladas en grid-area 1/1 (crossfade,
 * sin auto-advance). Atribución en una línea: dash 32px + nombre 800 +
 * rol; case margin 8px 0 0 44px; contador "01 / 03"; controles 48px.
 * Fondo: .f-kw-grain con kind-words-grain-desktop.webp (phone en móvil),
 * width 131.875%, left −17.2917%, bottom −27px, mask fade últimos 120px.
 * La sección no tiene fondo propio (el rojo viene del grain).
 */
export default function ExpTestimonials() {
  const t = EXP_STRINGS.testimonials;
  const [index, setIndex] = useState(0);
  const total = EXP_TESTIMONIALS.length;
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
      <div className={styles.grain} aria-hidden="true" />
      <div className={"site-grid " + styles.content + " " + styles.grid}>
        <h2 className={"type-h2 " + styles.heading} id="exp-testimonials-heading" ref={headingRef}>
          {t.heading}
        </h2>

        <div className={styles.box}>
          <span className={styles.mark} aria-hidden="true">
            <span className={styles.markIn}>“</span>
          </span>
          <div className={styles.items}>
            {EXP_TESTIMONIALS.map((item, i) => (
              <figure
                key={item.name}
                className={styles.item + (i === index ? " " + styles.itemActive : "")}
              >
                <blockquote className={"type-h3 " + styles.text}>{item.quote}</blockquote>
                <figcaption className={styles.who}>
                  <span className={styles.dash} aria-hidden="true" />
                  <span className={styles.whoText}>
                    <span className={"type-body " + styles.name}>{item.name}</span>
                    <span className={"type-body " + styles.role}>{item.role}</span>
                  </span>
                </figcaption>
                {item.caseStudy ? (
                  <p className={styles.case}>
                    <a className={styles.caseLink} href={item.caseStudy}>
                      {item.caseStudyLabel} ↗
                    </a>
                  </p>
                ) : null}
              </figure>
            ))}
          </div>
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
