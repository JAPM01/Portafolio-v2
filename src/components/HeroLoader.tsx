"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero-loader.module.css";

/** HeroLoader (versión simplificada de la referencia): overlay oscuro
    con la marca "Aa" grande que se llena de blanco de abajo arriba,
    y luego se levanta y desaparece, revelando el hero. La referencia
    completa tiene paneles y variantes de ruta; aquí va el gesto visible
    de la carga inicial. */
export default function HeroLoader() {
  const [done, setDone] = useState(false);
  const [lifting, setLifting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    // Llenado de la marca (0 → 1) en ~0.7s.
    let raf = 0;
    const t0 = performance.now();
    const fill = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      overlay.style.setProperty("--fill", p.toFixed(3));
      if (p < 1) raf = requestAnimationFrame(fill);
    };
    raf = requestAnimationFrame(fill);
    // A los ~0.9s empieza a levantarse; a los ~1.4s ya no está.
    const liftTimer = window.setTimeout(() => {
      setLifting(true);
      document.documentElement.setAttribute("data-loaded", "");
      document.documentElement.setAttribute("data-hero-title", "");
    }, 900);
    const doneTimer = window.setTimeout(() => setDone(true), 1400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(liftTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (done) return null;
  return (
    <div
      className={`${styles.overlay} ${lifting ? styles.overlayLifting : ""}`}
      aria-hidden="true"
      ref={overlayRef}
    >
      <div className={styles.bigMark} />
    </div>
  );
}
