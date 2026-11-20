"use client";

import { useRef } from "react";
import { EXP_CLIENTS, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-clients.module.css";
import { useLiquidReveal } from "./useLiquidReveal";

/**
 * Clientes — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: "Clients" + nota; retícula de 8 columnas, celda ~232×195 px;
 * cada celda: logo en gris (color al hover) + nombre en mono + "Case
 * study" con flecha en los que tienen caso; la última celda es la
 * invitación ("This spot's open. Let's talk ↗").
 */
export default function ExpClients() {
  const t = EXP_STRINGS.clients;
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  useLiquidReveal(headingRef);

  return (
    <section className={styles.section} id="exp-clients" aria-labelledby="exp-clients-heading">
      <div className="site-grid">
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
                  <a className={styles.cellLink} href={client.caseStudy} target="_blank" rel="noreferrer">
                    {inner}
                  </a>
                ) : (
                  <div className={styles.cellLink}>{inner}</div>
                )}
              </li>
            );
          })}
          <li className={styles.cell + " " + styles.ctaCell}>
            <a className={styles.cta} href={t.ctaHref} target="_blank" rel="noreferrer">
              <span className="type-mono">{t.ctaTop}</span>
              <span className="type-mono">
                {t.ctaBottom} ↗
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
