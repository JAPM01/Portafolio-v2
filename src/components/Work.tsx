"use client";

import { useEffect, useRef } from "react";
import styles from "./work.module.css";
import WorkCaption from "./WorkCaption";
import { usePointerParallax, morphTarget, SETTLED } from "../lib/scroll";

/** Lorem Ipsum 1:1 — título gigante, 1 tarjeta destacada (Lorem Ipsum)
    con runway sticky: el marco crece de 1056×660 a 1392×870 al hacer
    scroll (--p), la foto hace parallax (--img-p) y el panel entra con
    --entry. Las otras 3 (Dolor, Sit Amet, Consectetur) son stills
    estáticos a ancho completo. Cursor flotante "View" sobre los marcos. */

const FEATURE = {
  title: "Lorem Ipsum",
  line: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud.",
  year: "2026",
  role: "Lorem ipsum dolor sit amet",
  img: "/placeholder.svg",
  href: "/work/temperance",
};

const STILLS = [
  {
    title: "Dolor",
    line: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam.",
    year: "2026",
    role: "Lorem ipsum dolor sit amet",
    img: "/placeholder.svg",
    href: "/work/bolt",
  },
  {
    title: "Sit Amet",
    line: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip.",
    year: "2026",
    role: "Lorem ipsum dolor sit amet",
    img: "/placeholder.svg",
    href: "/work/neugent",
  },
  {
    title: "Consectetur",
    line: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute.",
    year: "2025",
    role: "Lorem ipsum dolor sit amet",
    img: "/placeholder.svg",
    href: "/work/black-lily",
  },
];

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  usePointerParallax();

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const stage = runway.querySelector("[data-stage]") as HTMLElement | null;
    let p = 0;
    let raf = 0;
    let settled = true;
    let pinOffset = 0;
    const readPin = () => {
      pinOffset = stage ? parseFloat(getComputedStyle(stage).insetBlockStart) || 0 : 0;
    };
    readPin();
    // Driver exacto de la referencia: l = 1.5 * max(0, 280 - (top - pin)),
    // objetivo = morphTarget(l, .28, 140), lerp .09; --entry es el
    // progreso lineal del runway por el viewport.
    const loop = () => {
      const vh = window.innerHeight || 1;
      const top = runway.getBoundingClientRect().top;
      const l = 1.5 * Math.max(0, 280 - (top - pinOffset));
      const target = morphTarget(l, 0.28, 140);
      p += (target - p) * 0.09;
      if (Math.abs(target - p) < SETTLED) {
        p = target;
        settled = true;
      }
      const entry = Math.min(1, Math.max(0, (vh - top) / Math.max(1, vh - pinOffset)));
      runway.style.setProperty("--p", p.toFixed(4));
      runway.style.setProperty("--entry", entry.toFixed(4));
      if (!settled) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (settled) {
        settled = false;
        raf = requestAnimationFrame(loop);
      }
    };
    const onResize = () => {
      readPin();
      kick();
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // --img-p por marco: progreso del marco por el viewport (medido exacto
  // en la referencia: (vh - top) / (vh + height)).
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const vh = window.innerHeight;
      const setImgP = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const ip = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--img-p", ip.toFixed(4));
      };
      if (frameRef.current) setImgP(frameRef.current);
      document
        .querySelectorAll<HTMLElement>(`.${styles.stillFrame}`)
        .forEach(setImgP);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cursor flotante "View" sobre los marcos (solo puntero fino).
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;
    let x = -200;
    let y = -200;
    let tx = -200;
    let ty = -200;
    let rot = 0;
    let raf = 0;
    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      const vx = tx - x;
      const targetRot = Math.max(-8, Math.min(8, vx * 0.08));
      rot += (targetRot - rot) * 0.15;
      cursor.style.setProperty("--x", `${x.toFixed(1)}px`);
      cursor.style.setProperty("--y", `${y.toFixed(1)}px`);
      cursor.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const onOver = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-work-link]")) {
        cursor.setAttribute("data-on", "");
      } else {
        cursor.removeAttribute("data-on");
      }
    };
    const onDown = () => cursor.setAttribute("data-press", "");
    const onUp = () => cursor.removeAttribute("data-press");
    loop();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <section id="work" className={styles.section} aria-labelledby="work-heading" ref={sectionRef}>
      <div className="container">
        <h2 id="work-heading" className={styles.heading}>
          Lorem Ipsum
        </h2>
      </div>

      <div className={styles.runway} ref={runwayRef}>
        <div className={styles.stage} data-stage="">
          <a className={styles.panel} aria-label={FEATURE.title} href={FEATURE.href}>
            <span className={styles.frame} data-work-link="" data-work-media="" data-ptr-parallax="" ref={frameRef}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                aria-hidden="true"
                loading="lazy"
                width={2400}
                height={1500}
                decoding="async"
                className={styles.media}
                src={FEATURE.img}
              />
            </span>
          </a>
        </div>
      </div>

      <a className={styles.captionAfter} href={FEATURE.href}>
        <WorkCaption title={FEATURE.title} line={FEATURE.line} year={FEATURE.year} role={FEATURE.role} />
      </a>

      <ol className={styles.stills}>
        {STILLS.map((s) => (
          <li key={s.title}>
            <a className={styles.still} href={s.href}>
              <span className={styles.stillFrame} data-work-link="" data-work-media="" data-ptr-parallax="">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  width={2400}
                  height={1500}
                  decoding="async"
                  className={styles.stillMedia}
                  src={s.img}
                />
              </span>
              <WorkCaption title={s.title} line={s.line} year={s.year} role={s.role} />
            </a>
          </li>
        ))}
      </ol>

      <div className={styles.cursor} ref={cursorRef} aria-hidden="true">
        <span className={styles.cursorLabel}>View</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            d="M18.5 12L4.99997 12"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </section>
  );
}
