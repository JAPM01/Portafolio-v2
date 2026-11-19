"use client";

import { EXP_MANIFESTO, EXP_STRINGS, useExpLang } from "../../lib/exp-content";
import styles from "./exp-manifesto.module.css";

/**
 * Manifiesto — clon 1:1 TOTAL de Melon About (medido en vivo, 19 Nov 2026).
 * Melon: statement gigante a todo lo ancho EN ROJO con un disco rojo con
 * retrato circular incrustado en la frase (aquí disco rojo con "JP" hasta
 * que el retrato entre por git) y debajo dos párrafos en dos columnas +
 * enlace "More about me". Sin principios numerados (eso es Moisez, no Melon).
 */
export default function ExpManifesto() {
  const lang = useExpLang();
  const t = EXP_STRINGS.manifesto;
  const anchor = lang === "es" ? "usabilidad" : "usability";
  const [before, after] = t.intro[lang].split(anchor);
  const [first, second, third] = EXP_MANIFESTO.principles;

  return (
    <section className={styles.section} id="exp-manifesto" aria-labelledby="exp-manifesto-heading">
      <div className="site-grid">
        <p className={"type-h2 " + styles.statement + " " + styles.inkRed} id="exp-manifesto-heading">
          {before}
          {anchor}
          <span className={styles.disc} aria-hidden="true">
            JP
          </span>
          {after}
        </p>

        <div className={styles.body}>
          <p className={"type-body " + styles.ink}>
            {first.title[lang]} {first.desc[lang]}
          </p>
          <p className={"type-body " + styles.ink}>
            {second.title[lang]} {second.desc[lang]}
          </p>
        </div>
        <div className={styles.body + " " + styles.bodySecond}>
          <p className={"type-body " + styles.ink}>
            {third.title[lang]} {third.desc[lang]}
          </p>
          <p className={"type-body " + styles.inkMuted}>
            <a className={styles.moreLink} href="#exp-cv">
              {lang === "es" ? "Más sobre mí ↗" : "More about me ↗"}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
