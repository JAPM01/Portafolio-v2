"use client";

import { EXP_STRINGS, usePoznanTime } from "../../lib/exp-content";
import styles from "./exp-hero.module.css";

/**
 * Hero estilo Melon (base de la v2, 19 Nov 2026): gradiente rojo→oscuro,
 * wordmark "melon" en gótica con degradado blanco→rojo oscuro recortado
 * por arriba, frase abajo a la izquierda y hora de Poznań + disponibilidad
 * en mono abajo a la derecha. Clon 1:1 pixel a pixel (textos de Melon).
 */
export default function ExpHero() {
  const t = EXP_STRINGS.hero;
  const time = usePoznanTime();

  return (
    <section className={styles.section} id="exp-hero" aria-labelledby="exp-hero-heading">
      <h1 className={"type-h1 " + styles.word} id="exp-hero-heading">
        {t.word}
      </h1>
      <div className={"site-grid " + styles.bottom}>
        <p className={"type-body " + styles.phrase}>{t.phrase}</p>
        <div className={styles.meta}>
          <span className="type-mono">
            {time} {t.place}
          </span>
          <span className={"type-mono " + styles.avail}>
            <span className={styles.dot} aria-hidden="true" />
            {t.available}
          </span>
        </div>
      </div>
    </section>
  );
}
