"use client";

import { useEffect, useRef, useState } from "react";
import { EXP_LOGO } from "../../lib/exp-content";
import styles from "./exp-preloader.module.css";

/**
 * Preloader de Melon (.f-ld, CSS capturado, 19 Nov 2026):
 * fixed inset 0, z 200, height 100dvh, visible solo con html.f-loading.
 * Sheet rojo absoluto + panel negro absoluto encima. Mark 154×70
 * centrado (translate −50%), máscara Logo-melon.svg contain, ghost
 * opacity .2 + fill con clip-path inset(0% 100% 0% 0%) que se revela
 * con el conteo. Labels "Loading"/"Ready" 500 12px/1 mono, LS .08em,
 * uppercase, bottom 45, left gutter. Count 400 clamp(72px, 12.5vw,
 * 216px)/.78 mono, LS -.06em, tabular-nums, bottom 40, right gutter,
 * el "%" a .26em opacity .55. Bar roja height 6px, scaleX(0→1),
 * origin 0, bottom 0. Móvil: mark 110×50, labels bottom 32 left 16,
 * count clamp(64px, 24vw, 120px) bottom 30 right 16.
 * Salida: el panel negro sube, luego el sheet rojo. Se respeta
 * prefers-reduced-motion (salida inmediata).
 */
export default function ExpPreloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("f-loading");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCount(100);
      setDone(true);
      const id = window.setTimeout(() => {
        setGone(true);
        root.classList.remove("f-loading");
      }, 100);
      return () => {
        window.clearTimeout(id);
        root.classList.remove("f-loading");
      };
    }
    const DURATION = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      // Easing suave: rápido al inicio, lento al final.
      const eased = 1 - Math.pow(1 - p, 2);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        window.setTimeout(() => setDone(true), 300);
        window.setTimeout(() => {
          setGone(true);
          root.classList.remove("f-loading");
        }, 300 + 900);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      root.classList.remove("f-loading");
    };
  }, []);

  if (gone) return null;
  const ready = count >= 100;

  return (
    <div className={styles.overlay + (done ? " " + styles.done : "")} aria-hidden="true">
      <div className={styles.sheet} />
      <div className={styles.panel}>
        <div className={styles.mark}>
          <span className={styles.markGhost} style={{ maskImage: `url(${EXP_LOGO})`, WebkitMaskImage: `url(${EXP_LOGO})` }} />
          <span
            className={styles.markFill}
            style={{
              maskImage: `url(${EXP_LOGO})`,
              WebkitMaskImage: `url(${EXP_LOGO})`,
              clipPath: `inset(0% ${100 - count}% 0% 0%)`,
            }}
          />
        </div>
        <div className={styles.labels}>
          <span className={"type-mono " + styles.label + (ready ? "" : " " + styles.labelActive)}>Loading</span>
          <span className={"type-mono " + styles.label + (ready ? " " + styles.labelActive : "")}>Ready</span>
        </div>
        <div className={styles.count}>
          {count}
          <span className={styles.percent}>%</span>
        </div>
        <div className={styles.bar} style={{ transform: `scaleX(${count / 100})` }} />
      </div>
    </div>
  );
}
