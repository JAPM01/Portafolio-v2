"use client";

import { useEffect, useRef } from "react";
import { EXP_STRINGS, usePoznanTime } from "../../lib/exp-content";
import styles from "./exp-hero.module.css";

/**
 * Hero estilo Melon (CSS capturado de melon.studio, 19 Nov 2026):
 * - Parallax: .inner se traslada translate3d(0, scrollY*0.4, 0) y la
 *   variable --hero-y mueve la fila inferior; fade a negro ligado al
 *   scroll con --hero-fade 0→1 entre el 3% y el 22% del alto del hero
 *   (parallax .4, fadeStart .03, fadeEnd .22).
 * - Wordmark: vector de Melon (melon-gradient-tlo.svg) como máscara
 *   sobre degradado radial blanco→rojo oscuro, recortado por arriba
 *   y por los lados.
 * - Fondo: imagen fija de Melon (hero-still-1600.webp; 800px en móvil),
 *   con onda animada (.hero__wave: speed .8, scale 1.82, rotation 180,
 *   waveAmp .25) reproducida en canvas 2D con la misma imagen.
 * - Frase 40px/26px early-sans 300; meta 13px Geist Mono 500 con punto
 *   blanco de 7px con halo; grid frase 1/8, meta 9/13.
 * Las URLs son remotas de melon.studio (en vivo y en local).
 */
export default function ExpHero() {
  const t = EXP_STRINGS.hero;
  const time = usePoznanTime();
  const sectionRef = useRef<HTMLElement | null>(null);
  const waveRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const inner = section.querySelector<HTMLElement>(`.${styles.inner}`);
    const bottom = section.querySelector<HTMLElement>(`.${styles.bottomWrap}`);
    const fade = section.querySelector<HTMLElement>(`.${styles.fade}`);
    if (!inner || !bottom || !fade) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const PARALLAX = window.innerWidth <= 1023 ? 0.2 : 0.4;
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

  // Onda animada del hero (Melon .hero__wave): la imagen fija con
  // desplazamiento senoidal por franjas, speed .8, amplitud .25.
  useEffect(() => {
    const canvas = waveRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    img.decoding = "async";
    img.src =
      window.innerWidth <= 1023
        ? "https://melon.studio/brand/hero-still-800.webp"
        : "https://melon.studio/brand/hero-still-1600.webp";
    let raf = 0;
    let off: HTMLCanvasElement | null = null;

    const paint = (t: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !off) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const STEP = 4;
      for (let y = 0; y < H; y += STEP) {
        const dx =
          Math.sin(y * 0.02 + t * 0.8) * 12 + Math.sin(y * 0.005 - t * 0.6) * 8;
        ctx.drawImage(off, 0, y, W, STEP, dx, y, W, STEP);
      }
    };

    const loop = (ms: number) => {
      paint(ms / 1000);
      raf = requestAnimationFrame(loop);
    };

    const size = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext("2d");
      if (!octx || !img.naturalWidth) return;
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight,
      );
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      octx.drawImage(img, (canvas.width - dw) / 2, 0, dw, dh);
      if (reduced) paint(0);
    };

    img.onload = () => {
      size();
      if (!reduced) raf = requestAnimationFrame(loop);
    };
    size();
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <section className={styles.section} id="exp-hero" ref={sectionRef}>
      <h1 className="sr-only">
        melon studio — UX/UI, web, app and SaaS design studio in Poznań, Poland
      </h1>
      <div className={styles.inner} aria-hidden="true">
        <canvas ref={waveRef} className={styles.wave} aria-hidden="true" />
        <div className={styles.wordmark} />
        <div className={styles.silhouette} />
      </div>
      <div className={styles.fade} aria-hidden="true" />
      <div className={"site-grid " + styles.bottomWrap}>
        <p className={"type-body " + styles.phrase}>
          <span className={styles.phraseLine}>{t.phrase}</span>
        </p>
        <div className={styles.meta}>
          <span className={"type-mono " + styles.metaLine + " " + styles.metaFirst}>
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
