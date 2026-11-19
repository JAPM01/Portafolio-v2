"use client";

import { EXP_EXPERIENCE, EXP_STRINGS, useExpLang } from "../../lib/exp-content";
import styles from "./exp-experience.module.css";

const TILE_CLASS: Record<string, string> = {
  red: "tileRed",
  outline: "tileOutline",
  dark: "tileDark",
  gray: "tileGray",
};

/**
 * Experiencia — versión experimento.
 * Referencias: Melon (título grande a la izquierda, lista a la derecha) y
 * Osten Wilde (tabla cronológica con hairlines). Solo trayectoria de diseño.
 * Retícula: la compartida (.site-grid).
 */
export default function ExpExperience() {
  const lang = useExpLang();
  const t = EXP_STRINGS.experience;

  return (
    <section className={styles.section} id="exp-experience" aria-labelledby="exp-experience-heading">
      <div className="site-grid">
        <div className={styles.head}>
          <p className={"type-mono " + styles.label}>{t.label[lang]}</p>
          <h2 className={"type-h2 " + styles.heading} id="exp-experience-heading">
            {t.heading[lang]}
          </h2>
        </div>

        <ul className={styles.list}>
          {EXP_EXPERIENCE.map((job) => (
            <li className={styles.row} key={job.name}>
              <span
                className={
                  styles.tile +
                  " " +
                  styles[TILE_CLASS[job.tile] ?? "tileGray"] +
                  (job.mono.length > 3 ? " " + styles.tileLong : "")
                }
                aria-hidden="true"
              >
                {job.mono}
              </span>
              <h3 className={"type-h4 " + styles.name}>{job.name}</h3>
              <p className={"type-body " + styles.role}>{job.role[lang]}</p>
              <p className={"type-mono " + styles.dates}>{job.dates[lang]}</p>
            </li>
          ))}
        </ul>

        <p className={"type-body " + styles.note}>{t.note[lang]}</p>
      </div>
    </section>
  );
}
