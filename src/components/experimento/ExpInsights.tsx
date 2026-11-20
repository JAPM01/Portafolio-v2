"use client";

import { useRef, useState } from "react";
import { EXP_INSIGHTS, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-insights.module.css";
import { useLiquidReveal } from "./useLiquidReveal";

/**
 * Insights — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: fondo crema, "Insights" + "All notes" a la derecha; split
 * 1/3–2/3: a la izquierda un marco con la imagen del artículo activo,
 * a la derecha las filas con hairlines (fecha, título + extracto,
 * categoría + tiempo de lectura + flecha). Al pasar el cursor por una
 * fila, la fila se vuelve roja con texto blanco y la imagen de la
 * izquierda cambia a la de ese artículo.
 */
export default function ExpInsights() {
  const t = EXP_STRINGS.insights;
  const [active, setActive] = useState(0);
  const activePost = EXP_INSIGHTS[active];
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useLiquidReveal(headingRef);

  return (
    <section className={styles.section} id="exp-insights" aria-labelledby="exp-insights-heading">
      <div className="site-grid">
        <div className={styles.headRow}>
          <h2 className={"type-h2 " + styles.heading + " " + styles.inkRed} id="exp-insights-heading" ref={headingRef}>
            {t.heading}
          </h2>
          <a className={"type-mono " + styles.allNotes + " " + styles.ink} href={t.allNotesHref}>
            {t.allNotes} →
          </a>
        </div>

        <div className={styles.peek} aria-hidden="true">
          <img key={activePost.title} className={styles.peekImg} src={activePost.image} alt="" loading="lazy" />
        </div>

        <ol className={styles.list}>
          {EXP_INSIGHTS.map((post, index) => (
            <li className={styles.row} key={post.title}>
              <a
                className={styles.rowLink}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <time className={"type-mono " + styles.date} dateTime={post.date}>
                  {post.date}
                </time>
                <span className={styles.main}>
                  <span className={"type-h5 " + styles.title + " " + styles.ink}>{post.title}</span>
                  <span className={"type-body " + styles.excerpt + " " + styles.inkMuted}>
                    {post.excerpt}
                  </span>
                </span>
                <span className={styles.meta}>
                  <span className={"type-mono " + styles.inkMuted}>{post.category}</span>
                  <span className={"type-mono " + styles.inkMuted}>
                    {post.read} →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
