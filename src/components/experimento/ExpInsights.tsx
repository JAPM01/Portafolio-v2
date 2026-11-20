"use client";

import { useRef, useState } from "react";
import { EXP_INSIGHTS, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-insights.module.css";
import { useLiquidReveal } from "./useLiquidReveal";

/**
 * Insights — clon 1:1 de Melon (CSS capturado, 19 Nov 2026):
 * Fondo crema, título 140px sans + "All notes" a la derecha (grid 1/9
 * y 9/−1). Peek grid 1/5, sticky top 14vh, margin-top 10vh, frame
 * aspect 4/5, imágenes apiladas absolutas (crossfade al cambiar).
 * Lista grid 6/−1, margin-top 10vh; fila grid 88px 1fr 136px,
 * padding 26px 22px 30px, column-gap 24; fecha/meta 13px mono color
 * 62%, padding-top .45em; título 400 30.4px/1.16, LS -.02em; extracto
 * 400 16px/1.45, color 55%, margin-top 10px, max-width 56ch; meta en
 * columna a la derecha, gap 12; flecha SVG 14×14. Hover: barrido rojo
 * con clip-path inset izquierda→derecha + texto blanco. Móvil: oculta
 * extracto, miniatura 72px por fila.
 */
export default function ExpInsights() {
  const t = EXP_STRINGS.insights;
  const [active, setActive] = useState(0);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useLiquidReveal(headingRef, "--melon-dark");

  return (
    <section className={styles.section} id="exp-insights" aria-labelledby="exp-insights-heading">
      <div className="site-grid">
        <div className={styles.headRow}>
          <h2 className={"type-h2 " + styles.heading} id="exp-insights-heading" ref={headingRef}>
            {t.heading}
          </h2>
          <a className={"type-mono " + styles.allNotes} href={t.allNotesHref}>
            {t.allNotes} →
          </a>
        </div>

        <div className={styles.peek} aria-hidden="true">
          {EXP_INSIGHTS.map((post, index) => (
            <img
              key={post.title}
              className={styles.peekImg + (index === active ? " " + styles.peekImgActive : "")}
              src={post.image}
              alt=""
              loading="lazy"
            />
          ))}
        </div>

        <ol className={styles.list}>
          {EXP_INSIGHTS.map((post, index) => (
            <li className={styles.row} key={post.title}>
              <a
                className={styles.rowLink}
                href={post.link}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <img className={styles.thumb} src={post.image} alt="" loading="lazy" />
                <time className={"type-mono " + styles.date} dateTime={post.dateISO}>
                  {post.date}
                </time>
                <span className={styles.main}>
                  <span className={"type-h5 " + styles.title}>{post.title}</span>
                  <span className={"type-body " + styles.excerpt}>
                    {post.excerpt}
                  </span>
                </span>
                <span className={styles.meta}>
                  <span className={"type-mono " + styles.metaText}>{post.category}</span>
                  <span className={"type-mono " + styles.metaText}>
                    {post.read}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
