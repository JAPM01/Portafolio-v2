"use client";

import styles from "./exp-grid-lines.module.css";

/**
 * Líneas verticales de fondo estilo Moisez (v2 con motion): la retícula
 * de 12 columnas como hairlines tenues fijas sobre toda la página.
 * No interceptan clics y quedan por debajo del header y del preloader.
 */
export default function ExpGridLines() {
  return (
    <div className={styles.lines} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className={styles.line} />
      ))}
    </div>
  );
}
