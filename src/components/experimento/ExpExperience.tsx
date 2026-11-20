"use client";

import { EXP_EXPERIENCE, EXP_FREELANCE, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-experience.module.css";

/**
 * Experiencia — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: split título/lista (título grande a la izquierda, lista a la
 * derecha); cada fila: logo cuadrado 72×72 + nombre + rol gris + fecha
 * en mono a la derecha; hairlines. Abajo: "As a freelancer I worked
 * with" + los 4 nombres como wordmarks de texto.
 */
export default function ExpExperience() {
  const t = EXP_STRINGS.experience;

  return (
    <section className={styles.section} id="exp-experience" aria-labelledby="exp-experience-heading">
      <div className="site-grid">
        <div className={styles.head}>
          <h2 className={"type-h2 " + styles.heading} id="exp-experience-heading">
            {t.heading}
          </h2>
        </div>

        <ul className={styles.list}>
          {EXP_EXPERIENCE.map((job) => (
            <li className={styles.row} key={job.name}>
              <img className={styles.tile} src={job.tile} alt={job.tileAlt} loading="lazy" />
              <h3 className={"type-h4 " + styles.name}>{job.name}</h3>
              <p className={"type-body " + styles.role}>{job.role}</p>
              <p className={"type-mono " + styles.dates}>{job.dates}</p>
            </li>
          ))}
        </ul>

        <div className={styles.free}>
          <p className={"type-body " + styles.freeLabel}>{t.freelanceLabel}</p>
          <ul className={styles.freeLogos}>
            {EXP_FREELANCE.map((name) => (
              <li className={"type-h5 " + styles.freeName} key={name}>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
