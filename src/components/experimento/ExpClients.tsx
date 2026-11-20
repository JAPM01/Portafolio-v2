"use client";

import { useRef } from "react";
import { EXP_CLIENTS, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-clients.module.css";
import { useLiquidReveal } from "./useLiquidReveal";

/**
 * Clientes — clon 1:1 de Melon (CSS capturado, 19 Nov 2026):
 * Título clamp(2.4rem, 3.6vw, 4rem) = 64px desktop / 38.4px móvil;
 * nota 17px. Grid --cl-cols 8 (4 en ≤1099px, 3 en ≤809px),
 * margin 9vh 0 0 −1px. Celda aspect 1/.82 (móvil 1/1.05, padding
 * 12px 8px 30px); --logo-u clamp(32px, 3vw, 50px) (29px móvil).
 * Cap absolute bottom 14, left/right 16, 400 14px/1.2, opacity 0
 * (en celdas con enlace: opacity 1, color 55%, columna). Hover
 * INVIERTE la celda (fondo blanco, logo a color, etiqueta negra).
 * CTA "This spot's open. / Let's talk ↗" 400 clamp(17px, 1.45vw, 22px)/1.15.
 * Última celda móvil: si es 3n+1 ocupa 1/−1, si 3n+2 span 2.
 */
export default function ExpClients() {
  const t = EXP_STRINGS.clients;
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useLiquidReveal(headingRef);

  return (
    <section className={styles.section} id="exp-clients" aria-labelledby="exp-clients-heading">
      <div className={"site-grid " + styles.grid}>
        <div className={styles.head}>
          <h2 className={"type-h2 " + styles.heading} id="exp-clients-heading" ref={headingRef}>
            {t.heading}
          </h2>
          <p className={"type-body " + styles.note}>{t.note}</p>
        </div>

        <ul className={styles.wall}>
          {EXP_CLIENTS.map((client) => {
            const inner = (
              <>
                <img className={styles.logo} src={client.logo} alt="" loading="lazy" />
                <span className={styles.cap}>
                  <span className={"type-mono " + styles.name}>{client.name}</span>
                  {client.caseStudy ? (
                    <span className={"type-mono " + styles.caseStudy}>{t.caseStudy}</span>
                  ) : null}
                </span>
                {client.caseStudy ? (
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                ) : null}
              </>
            );
            return (
              <li className={styles.cell} key={client.name}>
                {client.caseStudy ? (
                  <a className={styles.cellLink} href={client.caseStudy}>
                    {inner}
                  </a>
                ) : (
                  <div className={styles.cellLink}>{inner}</div>
                )}
              </li>
            );
          })}
          <li className={styles.cell + " " + styles.ctaCell}>
            <a className={styles.cta} href={t.ctaHref}>
              <span className={"type-mono " + styles.ctaText}>{t.ctaTop}</span>
              <span className={"type-mono " + styles.ctaText}>
                {t.ctaBottom} ↗
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
