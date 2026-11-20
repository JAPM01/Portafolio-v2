"use client";

import { useEffect, useRef } from "react";
import { EXP_STRINGS } from "../../lib/exp-content";
import styles from "./exp-manifesto.module.css";

/**
 * Manifiesto — clon 1:1 de Melon About (CSS capturado, 19 Nov 2026):
 * Melon revela el statement PALABRA POR PALABRA ligado al scroll: las
 * palabras aún no reveladas son manchas rojas borrosas (blur hasta 40px);
 * al revelarse quedan negras y nítidas, salvo "slick SaaS" y "details
 * that", que quedan en rojo. Avanza ~6 palabras por cada ~250px de scroll.
 * Statement 300 clamp(2.25rem, 5.15vw, 6.5rem)/1.02 = 98.9px desktop,
 * 33.5px móvil, LS -.038em; disco 1.2136em. Cuerpo grid 7/−1, 2 columnas,
 * 400 18px/1.55, margin-top 14vh, p max-width 351px. "More about me" es
 * enlace .f-showall (roll + flechas) en grid-area 2/1/auto/7. Se respeta
 * prefers-reduced-motion (todo nítido).
 */
const HIGHLIGHT = new Set(["slick", "SaaS", "details", "that"]);

export default function ExpManifesto() {
  const t = EXP_STRINGS.about;
  const statementRef = useRef<HTMLParagraphElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Palabras del statement: antes + disco tras "Piotr" + después.
  const beforeWords = t.statementBefore.split(" ");
  const afterWords = t.statementAfter.split(" ");
  const words: { text: string; highlight: boolean }[] = [
    ...beforeWords.map((w) => ({ text: w, highlight: HIGHLIGHT.has(w) })),
    ...afterWords.map((w) => ({ text: w, highlight: HIGHLIGHT.has(w) })),
  ];
  const discAfter = beforeWords.length; // el disco va tras "Piotr"

  useEffect(() => {
    const el = statementRef.current;
    if (!el) return;
    const target: HTMLParagraphElement = el;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spans = wordRefs.current;
    if (reduced) {
      spans.forEach((s, i) => {
        if (!s) return;
        s.style.filter = "";
        // Revelado completo: oscuro (o rojo si es destacada).
        s.style.setProperty("--w", words[i]?.highlight ? "0" : "1");
      });
      return;
    }
    const MAX_BLUR = window.innerWidth <= 810 ? 14 : 40;
    const WORDS_PER_PX = 6 / 250; // ~6 palabras por cada 250px de scroll
    let raf = 0;

    function update() {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const vpH = window.innerHeight;
      // Distancia que el top del statement ha entrado en el viewport.
      const dist = Math.max(0, vpH - rect.top);
      const revealed = dist * WORDS_PER_PX;
      const n = spans.length;
      spans.forEach((s, i) => {
        if (!s) return;
        const p = Math.min(1, Math.max(0, revealed - i));
        const blur = (1 - p) * MAX_BLUR;
        s.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
        // El color se interpola en CSS con color-mix y --w (rojo → oscuro;
        // las destacadas quedan en rojo: --w = 0 siempre).
        const hl = words[i]?.highlight;
        s.style.setProperty("--w", hl ? "0" : p.toFixed(3));
      });
    }

    function onScroll() {
      if (!raf) raf = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.section} id="exp-manifesto" aria-labelledby="exp-manifesto-heading">
      <div className="site-grid">
        <h2 className="sr-only" id="exp-manifesto-heading">
          About me
        </h2>
        <p className={"type-h2 " + styles.statement} ref={statementRef}>
          {words.slice(0, discAfter).map((w, i) => (
            <span
              key={i}
              className={styles.word}
              ref={(s) => {
                wordRefs.current[i] = s;
              }}
            >
              {w.text}{" "}
            </span>
          ))}
          <span className={styles.disc} aria-hidden="true">
            <img src={t.portrait} alt="" loading="lazy" />
          </span>{" "}
          {words.slice(discAfter).map((w, j) => {
            const i = discAfter + j;
            return (
              <span
                key={i}
                className={styles.word}
                ref={(s) => {
                  wordRefs.current[i] = s;
                }}
              >
                {w.text}{" "}
              </span>
            );
          })}
        </p>

        <div className={styles.moreWrap}>
          <a className={"type-mono " + styles.moreLink} href={t.moreAboutHref}>
            <span className={styles.roll}>
              <span>{t.moreAbout}</span>
              <span aria-hidden="true">{t.moreAbout}</span>
            </span>
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8h9M19 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </div>

        <div className={styles.body}>
          <p className={"type-body " + styles.ink}>{t.paragraphs[0]}</p>
          <p className={"type-body " + styles.ink}>{t.paragraphs[1]}</p>
        </div>
      </div>
    </section>
  );
}
