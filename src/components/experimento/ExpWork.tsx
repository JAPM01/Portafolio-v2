"use client";

import { EXP_FEATURED, EXP_MORE, EXP_STRINGS, useExpLang } from "../../lib/exp-content";
import styles from "./exp-work.module.css";

/**
 * Trabajo seleccionado — clon 1:1 TOTAL de Melon (medido en vivo, 19 Nov 2026).
 * Melon: UNA columna; cada artículo es una rejilla de 2 columnas con
 * título/meta a la izquierda (alineados a la derecha, a la altura de la
 * parte superior de la imagen) e imagen a la derecha (~530px de alto).
 * Fondo crema, título gigante en gótica roja con "Ver todo" a la derecha.
 * "Más proyectos" como lista con hairlines (Insights). Sin blurbs.
 */
export default function ExpWork() {
  const lang = useExpLang();
  const t = EXP_STRINGS.work;

  return (
    <section className={styles.section} id="exp-work" aria-labelledby="exp-work-heading">
      <div className="site-grid">
        <div className={styles.headRow}>
          <h2 className={"type-h2 " + styles.heading + " " + styles.inkRed} id="exp-work-heading">
            {t.heading[lang]}
          </h2>
          <a className={"type-mono " + styles.showAll + " " + styles.ink} href="#exp-more">
            {t.showAll[lang]} →
          </a>
        </div>

        <div className={styles.list}>
          {EXP_FEATURED.map((project, index) => (
            <article className={styles.card} key={project.title}>
              <div className={styles.text}>
                <h3 className={"type-h5 " + styles.title + " " + styles.ink}>{project.title}</h3>
                <p className={"type-mono " + styles.meta + " " + styles.inkMuted}>
                  <span>
                    {String(index + 1).padStart(2, "0")} / {String(EXP_FEATURED.length).padStart(2, "0")} ·{" "}
                    {project.category}
                  </span>
                  <span>{project.status}</span>
                  {project.link ? (
                    <a className={styles.caseLink} href={project.link} target="_blank" rel="noreferrer">
                      {project.linkLabel?.[lang]} ↗
                    </a>
                  ) : null}
                </p>
              </div>
              <figure className={styles.media}>
                <img src={project.image} alt={project.imageAlt[lang]} loading="lazy" />
              </figure>
            </article>
          ))}
        </div>

        <p className={"type-mono " + styles.moreLabel + " " + styles.inkMuted}>{t.moreLabel[lang]}</p>
        <ul className={styles.moreList} id="exp-more">
          {EXP_MORE.map((project, index) => (
            <li className={styles.moreRow} key={project.title}>
              <span className={"type-mono " + styles.moreNum + " " + styles.inkMuted}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={"type-h5 " + styles.moreTitle + " " + styles.ink}>{project.title}</span>
              <span className={"type-mono " + styles.moreCat + " " + styles.inkMuted}>{project.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
