"use client";

import { useEffect, useRef } from "react";
import { EXP_STRINGS, usePoznanTime } from "../../lib/exp-content";
import styles from "./exp-hero.module.css";

/**
 * Hero estilo Melon (base de la v2, 19 Nov 2026), motion 1:1 (revisión
 * técnica con dev tools / scraping / DOM, 19 Nov 2026 ~19:00 CST):
 * - Parallax: .inner se traslada translate3d(0, scrollY*0.4, 0) y la
 *   variable --hero-y mueve la fila inferior; fade a negro ligado al
 *   scroll con --hero-fade 0→1 entre el 3% y el 22% del alto del hero
 *   (settings de Melon: parallax .4, fadeStart .03, fadeEnd .22).
 * - Wordmark: NO es texto — es el vector de Melon
 *   (melon-gradient-tlo.svg) como máscara sobre un degradado radial
 *   blanco→rojo oscuro, recortado por arriba y por los lados.
 * - Fondo: la imagen fija de Melon (hero-still-1600.webp), base del
 *   gradiente animado (WebGL) de Melon.
 * - Frase y meta: reveal de entrada (líneas con máscara / yPercent).
 * Las URLs son remotas de melon.studio (en vivo); en local se cambian
 * temporalmente a /Portafolio-v2/exp/melon/... para validar y se restauran.
 */
export default function ExpHero() {
  const t = EXP_STRINGS.hero;
  const time = usePoznanTime();
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const inner = section.querySelector<HTMLElement>(`.${styles.inner}`);
    const bottom = section.querySelector<HTMLElement>(`.${styles.bottomWrap}`);
    const fade = section.querySelector<HTMLElement>(`.${styles.fade}`);
    if (!inner || !bottom || !fade) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const PARALLAX = 0.4;
    const FADE_START = 0.03;
    const FADE_END = 0.22;
    let raf = 0;
    let last = -1;

    const update = (scrollY: number, force = false) => {
      const h = section.offsetHeight || window.innerHeight;
      const c = Math.max(0, Math.min(scrollY, h));
      if (!force && c === last) return;
      last = c;
      const u = (c * PARALLAX).toFixed(2);
      inner.style.transform = c ? `translate3d(0, ${u}px, 0)` : "";
      bottom.style.setProperty("--hero-y", c ? `${u}px` : "0px");
      const d = (c / h - FADE_START) / Math.max(0.001, FADE_END - FADE_START);
      fade.style.setProperty("--hero-fade", Math.min(1, Math.max(0, d)).toFixed(3));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => update(window.scrollY));
    };

    update(window.scrollY, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      inner.style.transform = "";
      bottom.style.removeProperty("--hero-y");
      fade.style.removeProperty("--hero-fade");
    };
  }, []);

  return (
    <section className={styles.section} id="exp-hero" ref={sectionRef}>
      <h1 className="sr-only">
        melon studio — UX/UI, web, app and SaaS design studio in Poznań, Poland
      </h1>
      <div className={styles.inner} aria-hidden="true">
        <div className={styles.wordmark} />
        <div className={styles.silhouette} />
      </div>
      <div className={styles.fade} aria-hidden="true" />
      <div className={"site-grid " + styles.bottomWrap}>
        <p className={"type-body " + styles.phrase}>
          <span className={styles.phraseLine}>{t.phrase}</span>
        </p>
        <div className={styles.meta}>
          <span className={"type-mono " + styles.metaLine}>
            {time} {t.place}
          </span>
          <span className={"type-mono " + styles.avail + " " + styles.metaLine}>
            <span className={styles.dot} aria-hidden="true" />
            {t.available}
          </span>
        </div>
      </div>
    </section>
  );
}
