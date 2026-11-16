"use client";

import styles from "./mark-showcase.module.css";

/** MarkShowcase 1:1 — la marca "Aa" en un marco 16/10 que deriva con el
    scroll (view-timeline, markDrift: +65px → −65px). La referencia
    renderiza la marca en 3D (WebGL); aquí se usa el glifo SVG de la
    marca en el mismo marco y con el mismo drift. */
export default function MarkShowcase() {
  return (
    <section className={styles.section}>
      <div className="container-indent">
        <div className={styles.frame} data-mark-media="true">
          <div className={styles.stage} aria-hidden="true">
            <div className={styles.mark} />
          </div>
        </div>
      </div>
    </section>
  );
}
