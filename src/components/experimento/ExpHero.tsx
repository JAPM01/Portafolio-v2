"use client";

import { EXP_STRINGS, useExpLang, usePachucaTime } from "../../lib/exp-content";
import styles from "./exp-hero.module.css";

/**
 * Hero estilo Melon (base de la v2, 19 Nov 2026): gradiente rojo→oscuro,
 * palabra gigante en gótica con degradado blanco→rojo oscuro recortada por
 * arriba, frase abajo a la izquierda y hora + disponibilidad en mono abajo
 * a la derecha. Clon 1:1 total: rojo, crema y oscuro de Melon, gótica
 * Pirata One (sustituta abierta de Lekick).
 */
export default function ExpHero() {
  const lang = useExpLang();
  const t = EXP_STRINGS.hero;
  const time = usePachucaTime();

  return (
    <section className={styles.section} id="exp-hero" aria-labelledby="exp-hero-heading">
      <h1 className={"type-h1 " + styles.word} id="exp-hero-heading">
        Jafet Pérez
      </h1>
      <div className={"site-grid " + styles.bottom}>
        <p className={"type-body " + styles.phrase}>{t.phrase[lang]}</p>
        <div className={styles.meta}>
          <span className="type-mono">{time}</span>
          <span className={"type-mono " + styles.avail}>
            <span className={styles.dot} aria-hidden="true" />
            {t.available[lang]}
          </span>
        </div>
      </div>
    </section>
  );
}
