"use client";

import { useEffect, useState } from "react";
import styles from "./exp-preloader.module.css";

/**
 * Preloader estilo Moisez (v2 con motion, 19 Nov 2026), medido en vivo:
 * pantalla azul sólida con un disco negro que rebota (asterisco de 8
 * puntas + anillo fino, ambos azules) y salida en 12 franjas verticales
 * que se deslizan hacia arriba, escalonadas de izquierda a derecha.
 * El rojo de Moisez es azul aquí (sin naranja ni cian). El hero ya está
 * debajo y se revela de izquierda a derecha. Se desmonta a los ~2.2 s.
 */
export default function ExpPreloader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setGone(true), 2200);
    return () => window.clearTimeout(id);
  }, []);

  if (gone) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.strips}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={styles.strip} style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <div className={styles.ball}>
        <svg className={styles.disc} viewBox="0 0 155 155">
          <circle className={styles.discFill} cx="77.5" cy="77.5" r="77.5" />
          <circle className={styles.discRing} cx="77.5" cy="77.5" r="70" />
          <g className={styles.discStar}>
            <line x1="77.5" y1="30" x2="77.5" y2="125" />
            <line x1="30" y1="77.5" x2="125" y2="77.5" />
            <line x1="44" y1="44" x2="111" y2="111" />
            <line x1="111" y1="44" x2="44" y2="111" />
          </g>
        </svg>
        <span className={styles.shadow} />
      </div>
    </div>
  );
}
