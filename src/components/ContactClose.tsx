"use client";

import { useEffect, useRef } from "react";
import { px } from "../lib/paths";
import styles from "./contact-close.module.css";
import { useSectionProgress } from "../lib/scroll";

/** ContactClose 1:1 — fondo velo (3 panes con blur/máscara), marca "Aa"
    + sociales, pitch con CTA, nombre gigante "Jafet" con rise por
    scroll y efecto outline al pasar el ratón, y colofón. Tema oscuro. */

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jafetperezmondragon/",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path d="M7 10V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M11 13V17M11 13C11 11.3431 12.3431 10 14 10C15.6569 10 17 11.3431 17 13V17M11 13V10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M7.125 6.75H7M7.25 6.75C7.25 6.88807 7.13807 7 7 7C6.86193 7 6.75 6.88807 6.75 6.75C6.75 6.61193 7.25 6.61193 7.25 6.75Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://example.com",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path d="M3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M17.3748 6.75024H17.2498M17.4998 6.75024C17.4998 6.88832 17.3878 7.00024 17.2498 7.00024C17.1117 7.00024 16.9998 6.88832 16.9998 6.75024C16.9998 6.61217 17.1117 6.50024 17.2498 6.50024C17.3878 6.50024 17.4998 6.61217 17.4998 6.75024Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://example.com",
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
        <path d="M3 21L10.5484 13.4516M21 3L13.4516 10.5484M13.4516 10.5484L8 3H3L10.5484 13.4516M13.4516 10.5484L21 21H16L10.5484 13.4516" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const NAME_DEFAULT = "Jafet";

const BLUR_BANDS = [
  { s: 0, e: 0.5 },
  { s: 0.5, e: 0.7071 },
  { s: 0.7071, e: 0.866 },
  { s: 0.866, e: 1 },
];

export default function ContactClose({
  heading = "Lorem ipsum dolor sit amet consectetur.",
  headingId = "contact-close-heading",
  headingLevel = "h2",
  name = NAME_DEFAULT,
  nameDivisor = 3.84,
  pitch,
  compact = false,
}: {
  heading?: string;
  headingId?: string;
  headingLevel?: "h1" | "h2";
  name?: string;
  nameDivisor?: number;
  pitch?: React.ReactNode;
  compact?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  useSectionProgress(sectionRef);

  // --p-reach: el máximo --p alcanzado (las letras se quedan arriba).
  useEffect(() => {
    const sec = sectionRef.current;
    const name = nameRef.current;
    if (!sec || !name) return;
    let raf = 0;
    let reach = 0;
    const loop = () => {
      const p = parseFloat(getComputedStyle(sec).getPropertyValue("--p")) || 0;
      if (p > reach) {
        reach = p;
        name.style.setProperty("--p-reach", reach.toFixed(4));
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hover del nombre: outline radial siguiendo el ratón (por letra).
  useEffect(() => {
    const name = nameRef.current;
    if (!name) return;
    let raf = 0;
    let mx = 0;
    let my = 0;
    let active = false;
    const apply = () => {
      raf = 0;
      const letters = name.querySelectorAll<HTMLElement>(`.${styles.letter}`);
      letters.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${(mx - r.left).toFixed(1)}px`);
        el.style.setProperty("--my", `${(my - r.top).toFixed(1)}px`);
        el.style.setProperty("--on", active ? "1" : "0");
      });
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      active = true;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      active = false;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    name.addEventListener("pointermove", onMove, { passive: true });
    name.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      name.removeEventListener("pointermove", onMove);
      name.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section id="contact-close" className={`${styles.section} ${styles.isBleed}`} aria-labelledby={headingId} ref={sectionRef}>
      <div className={styles.backdrop} aria-hidden="true" data-closer-backdrop="">
        <div className={`${styles.pane} ${styles.paneHaze}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.layer} src={px("/placeholder-transparent.svg")} alt="" />
        </div>
        <div className={`${styles.pane} ${styles.paneSoft}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.layer} src={px("/placeholder-transparent.svg")} alt="" />
        </div>
        <div className={`${styles.pane} ${styles.paneCrisp}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.layer} src={px("/placeholder-transparent.svg")} alt="" />
        </div>
      </div>

      <div className={`container-indent ${styles.inner} ${compact ? styles.innerCompact : ""}`}>
        <div className={`site-grid ${styles.head}`}>
          <div className={styles.brand}>
            <div className={styles.mark} aria-hidden="true" />
            <ul className={styles.socials}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a className={styles.social} href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.svg}
                    <span className={styles.socialLabel}>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.pitch}>
            {headingLevel === "h1" ? (
              <h1 id={headingId} className={styles.heading}>
                {heading}
              </h1>
            ) : (
              <h2 id={headingId} className={styles.heading}>
                {heading}
              </h2>
            )}
            {pitch ?? (
              <>
                <p className={styles.copy}>
                  Lorem ipsum dolor sit amet consectetur adipiscing elit sed
                  do eiusmod tempor.
                </p>
                <a className={styles.cta} href={px("/contact")}>
                  Start a project
                </a>
              </>
            )}
          </div>
        </div>

        <div className={styles.colophon}>
          <p
            className={styles.name}
            aria-hidden="true"
            style={
              {
                "--closer-name-opacity": 1,
                "--closer-rise-last": name.length - 1,
                "--closer-name-divisor": nameDivisor,
              } as React.CSSProperties
            }
            data-closer-name=""
            data-scroll-driven=""
            ref={nameRef}
          >
            <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute", inlineSize: 0, blockSize: 0 }}>
              <filter id="closer-name-outline" colorInterpolationFilters="sRGB" x="-50%" y="-50%" width="200%" height="200%">
                <feMorphology in="SourceAlpha" operator="erode" radius="2.5" result="thin" />
                <feComposite in="SourceAlpha" in2="thin" operator="out" result="ring" />
                <feComposite in="SourceGraphic" in2="ring" operator="in" />
              </filter>
            </svg>
            {Array.from(name).map((ch, i) => (
              <span key={i} className={styles.letter} data-anim-hidden="" data-ch={ch} style={{ "--i": i } as React.CSSProperties}>
                {ch}
              </span>
            ))}
            {BLUR_BANDS.map((b, i) => (
              <span
                key={i}
                className={styles.nameBlurBand}
                aria-hidden="true"
                style={{ "--s": b.s, "--e": b.e } as React.CSSProperties}
              />
            ))}
          </p>
          <p className={styles.copyright}>
            <span>© 2026</span>
            <a className={styles.colophonLink} href={px("/privacy")}>
              Privacy
            </a>
            <span className={styles.colophonNote}>Lorem ipsum dolor</span>
          </p>
        </div>
      </div>
    </section>
  );
}
