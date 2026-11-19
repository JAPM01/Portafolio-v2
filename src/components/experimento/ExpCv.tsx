"use client";

import { EXP_CV, EXP_CV_STATS, EXP_FEATURED, EXP_STRINGS, useExpLang } from "../../lib/exp-content";
import styles from "./exp-cv.module.css";

/**
 * Mi CV — versión experimento.
 * Fuente: CV de diseño (docx 15 Nov 2026) + estructura última acordada en
 * chat: encabezado, 4 bullets generales senior (sin herramientas, sin
 * repetir los proyectos) y 5 proyectos destacados.
 */
export default function ExpCv() {
  const lang = useExpLang();
  const t = EXP_STRINGS.cv;

  return (
    <section className={styles.section} id="exp-cv" aria-labelledby="exp-cv-heading">
      <div className="site-grid">
        <p className={"type-mono " + styles.label}>{t.label[lang]}</p>
        <h2 className={"type-h2 " + styles.heading} id="exp-cv-heading">
          {t.heading[lang]}
        </h2>

        <h3 className={"type-h3 " + styles.role}>{EXP_CV.header[lang]}</h3>
        <p className={"type-mono " + styles.meta}>{EXP_CV.meta[lang]}</p>

        <ul className={styles.stats}>
          {EXP_CV_STATS.map((stat) => (
            <li className={styles.stat} key={stat.label.es}>
              <span className={"type-h2 " + styles.statNum}>{stat.value}</span>
              <span className="type-mono">{stat.label[lang]}</span>
            </li>
          ))}
        </ul>

        <ul className={styles.bullets}>
          {EXP_CV.bullets[lang].map((bullet) => (
            <li className={"type-body " + styles.bullet} key={bullet}>
              {bullet}
            </li>
          ))}
        </ul>

        <p className={"type-mono " + styles.subLabel}>{EXP_STRINGS.work.label[lang]}</p>
        <ul className={styles.featured}>
          {EXP_FEATURED.slice(0, 5).map((project, index) => (
            <li className={styles.featuredRow} key={project.title}>
              <span className="type-mono">{String(index + 1).padStart(2, "0")}</span>
              <span className={"type-h5 " + styles.featuredTitle}>{project.title}</span>
              <span className="type-mono">{project.category}</span>
            </li>
          ))}
        </ul>

        <div className={styles.columns}>
          <div>
            <p className={"type-mono " + styles.subLabel}>{t.skills[lang]}</p>
            <p className="type-body">{EXP_CV.tools.join(" · ")}</p>
          </div>
          <div>
            <p className={"type-mono " + styles.subLabel}>{t.education[lang]}</p>
            <p className="type-body">{EXP_CV.education[lang]}</p>
            <p className="type-body">{EXP_CV.cert[lang]}</p>
            <p className="type-body">{EXP_CV.english[lang]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
