"use client";

import { EXP_CV, EXP_CV_STATS, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-cv.module.css";

/**
 * Mi CV — versión experimento.
 * Única sección que conserva contenido de Jafet (la pidió en sus
 * secciones de la v2; Melon no tiene equivalente). En inglés para que
 * el clon sea uniforme. Fuente: CV de diseño (docx 15 Nov 2026) +
 * estructura última acordada: encabezado, 4 bullets generales senior
 * (sin herramientas, sin repetir los proyectos) y 5 destacados.
 */
export default function ExpCv() {
  const t = EXP_STRINGS.cv;

  return (
    <section className={styles.section} id="exp-cv" aria-labelledby="exp-cv-heading">
      <div className="site-grid">
        <p className={"type-mono " + styles.label}>{t.label}</p>
        <h2 className={"type-h2 " + styles.heading} id="exp-cv-heading">
          {t.heading}
        </h2>

        <h3 className={"type-h3 " + styles.role}>{EXP_CV.header}</h3>
        <p className={"type-mono " + styles.meta}>{EXP_CV.meta}</p>

        <ul className={styles.stats}>
          {EXP_CV_STATS.map((stat) => (
            <li className={styles.stat} key={stat.label}>
              <span className={"type-h2 " + styles.statNum}>{stat.value}</span>
              <span className="type-mono">{stat.label}</span>
            </li>
          ))}
        </ul>

        <ul className={styles.bullets}>
          {EXP_CV.bullets.map((bullet) => (
            <li className={"type-body " + styles.bullet} key={bullet}>
              {bullet}
            </li>
          ))}
        </ul>

        <p className={"type-mono " + styles.subLabel}>Selected work</p>
        <ul className={styles.featured}>
          {EXP_CV.featured.map((project, index) => (
            <li className={styles.featuredRow} key={project.title}>
              <span className="type-mono">{String(index + 1).padStart(2, "0")}</span>
              <span className={"type-h5 " + styles.featuredTitle}>{project.title}</span>
              <span className="type-mono">{project.category}</span>
            </li>
          ))}
        </ul>

        <div className={styles.columns}>
          <div>
            <p className={"type-mono " + styles.subLabel}>{t.skills}</p>
            <p className="type-body">{EXP_CV.tools.join(" · ")}</p>
          </div>
          <div>
            <p className={"type-mono " + styles.subLabel}>{t.education}</p>
            <p className="type-body">{EXP_CV.education}</p>
            <p className="type-body">{EXP_CV.cert}</p>
            <p className="type-body">{EXP_CV.english}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
