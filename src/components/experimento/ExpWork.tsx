"use client";

import { useEffect, useRef } from "react";
import { EXP_FEATURED, EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-work.module.css";
import { useLiquidReveal } from "./useLiquidReveal";
import WarpImage, { type WarpHandle } from "./ExpWarpImage";

/**
 * Trabajo seleccionado — clon 1:1 de Melon (CSS capturado, 19 Nov 2026):
 * - Fondo NEGRO (#0f0000), título "Latest Work" blanco sans 300
 *   clamp(4rem, 12vw, 11rem)/.86 = 176px, LS -.05em, con reveal liquid
 *   ligado al scroll (blur 40px → 0, de "top bottom" a "top 40%").
 * - Head: padding 7svh, gutter 6svh; sección padding-bottom 16svh.
 * - Tarjetas centradas, width min(52vw, 92svh) = 993px, aspect 16/9
 *   (993×559), row-gap 3.5rem; caption ABSOLUTA a la izquierda de la
 *   tarjeta (top 0, right calc(100% + 24px + 8px), 18px/1, derecha) —
 *   NO sigue al cursor (lo que sigue al cursor es el dent de la cinta).
 * - Deformación WebGL2 de Melon en canvas 2D: driver = VELOCIDAD de
 *   scroll (VEL_NORM 400, V_SMOOTH .35), S completa (SHEET_C=1), dent
 *   bajo el puntero (DENT .065), oscurecimiento al salir por arriba.
 * - "Show all": 500 13px mono, subrayado 1px, roll SOLO en hover,
 *   flechas SVG 16×16 que se deslizan en hover.
 * Se respeta prefers-reduced-motion (sin deformación ni reveals).
 */
export default function ExpWork() {
  const t = EXP_STRINGS.work;
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const warpRefs = useRef<(WarpHandle | null)[]>([]);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  // Redibujar cuando una imagen termina de cargar o cambia el tamaño.
  const needsDrawRef = useRef(true);
  useLiquidReveal(headingRef);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const root: HTMLElement = section;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0;
    let lastDrawY = -1;
    let lastDrawPx = -1;
    let lastDrawPy = -1;

    function draw() {
      const vpH = window.innerHeight;
      const vpCenter = vpH / 2;
      const cards = root.querySelectorAll<HTMLElement>("." + styles.card);
      cards.forEach((card, i) => {
        const media = card.querySelector<HTMLElement>("." + styles.media);
        if (!media) return;
        const rect = media.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-0.6, Math.min(0.6, (center - vpCenter) / vpH));
        const dpr = Math.min(1.5, window.devicePixelRatio || 1);
        const p = pointerRef.current;
        warpRefs.current[i]?.draw({
          vel: reduced ? 0 : vel,
          progress,
          dentX: p.x * dpr,
          dentY: p.y * dpr,
          dentActive: p.active && !reduced,
        });
        // El título se apaga al salir por arriba (Melon).
        const text = card.querySelector<HTMLElement>("." + styles.text);
        if (text) {
          const fade = Math.max(0, Math.min(1, 1 + progress / 0.6));
          text.style.opacity = fade.toFixed(2);
        }
      });
    }

    function loop(now: number) {
      const dt = Math.max(1, now - lastT);
      const y = window.scrollY;
      const inst = ((y - lastY) / dt) * 1000; // px/s
      // Suavizado V_SMOOTH .35 (EMA); al parar, decae a 0.
      vel += (inst - vel) * 0.35;
      lastY = y;
      lastT = now;
      // Redibujar solo si algo cambió: scroll, velocidad, puntero,
      // carga de imagen o resize.
      const p = pointerRef.current;
      if (
        y !== lastDrawY ||
        Math.abs(vel) > 2 ||
        p.x !== lastDrawPx ||
        p.y !== lastDrawPy ||
        needsDrawRef.current
      ) {
        lastDrawY = y;
        lastDrawPx = p.x;
        lastDrawPy = p.y;
        needsDrawRef.current = false;
        draw();
      }
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      needsDrawRef.current = true;
    };
    window.addEventListener("resize", onResize);

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Dent bajo el puntero (posición relativa a la tarjeta, en px CSS).
  function onCardMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  }
  function onCardMouseLeave() {
    pointerRef.current.active = false;
  }

  return (
    <section
      className={styles.section}
      id="exp-work"
      aria-labelledby="exp-work-heading"
      ref={sectionRef}
    >
      <div className={"site-grid " + styles.grid}>
        <div className={styles.headRow}>
          <h2
            className={"type-h2 " + styles.heading}
            id="exp-work-heading"
            ref={headingRef}
          >
            {t.heading}
          </h2>
          <a className={"type-mono " + styles.showAll} href={t.showAllHref}>
            <span className={styles.roll}>
              <span className={styles.rollIn}>
                <span className={styles.rollT}>{t.showAll}</span>
                <span className={styles.rollT} aria-hidden="true">
                  {t.showAll}
                </span>
              </span>
            </span>
            <span className={styles.arrs} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
          </a>
        </div>

        <div className={styles.list}>
          {EXP_FEATURED.map((project, i) => (
            <article
              className={styles.card}
              key={project.title}
              onMouseMove={onCardMouseMove}
              onMouseLeave={onCardMouseLeave}
            >
              <div className={styles.text}>
                <h3 className={"type-h5 " + styles.title}>{project.title}</h3>
                <p className={"type-body " + styles.meta}>{project.meta}</p>
              </div>
              <figure className={styles.media}>
                <a href={project.link} aria-label={project.imageAlt}>
                  <WarpImage
                    ref={(h) => {
                      warpRefs.current[i] = h;
                    }}
                    src={project.image}
                    alt={project.imageAlt}
                    className={styles.warp}
                    onLoad={() => {
                      needsDrawRef.current = true;
                    }}
                  />
                </a>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
