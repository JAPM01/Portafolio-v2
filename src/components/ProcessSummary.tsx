"use client";

import { useRef } from "react";
import { px } from "../lib/paths";
import styles from "./process-summary.module.css";
import { useSectionProgress, useReveals, useTone } from "../lib/scroll";

/** How a project runs 1:1 — título, 3 pasos numerados (Scope, Draft,
    Live) con imagen cuadrada 160px y texto con acentos. El texto usa el
    mismo sistema de tono que Capabilities (armed → in → done). */

const STEPS = [
  {
    label: "Lorem",
    img: px("/placeholder.svg"),
    alt: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
    text: (
      <>
        Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad
        minim veniam quis nostrud exercitation ullamco laboris nisi aliquip
        ex ea commodo consequat duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.{" "}
        <em className={styles.accent}>Lorem ipsum dolor sit amet</em> with
        the scope and a <em className={styles.accent}>Lorem ipsum</em> for
        you to approve.
      </>
    ),
  },
  {
    label: "Ipsum",
    img: px("/placeholder.svg"),
    alt: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.",
    text: (
      <>
        Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad
        minim veniam quis nostrud exercitation ullamco laboris nisi aliquip
        ex ea commodo consequat duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur
        excepteur sint occaecat cupidatat non proident sunt in culpa qui
        officia deserunt mollit anim id est laborum lorem ipsum dolor sit
        amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua enim ad minim veniam quis nostrud{" "}
        <em className={styles.accent}>exercitation ullamco laboris</em>.{" "}
        <em className={styles.accent}>Lorem ipsum dolor</em> first. Lorem
        ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua enim ad minim
        veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea
        commodo consequat duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </>
    ),
  },
  {
    label: "Dolor",
    img: px("/placeholder.svg"),
    alt: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
    text: (
      <>
        Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad
        minim veniam quis nostrud exercitation ullamco laboris nisi aliquip
        ex ea commodo consequat duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur
        excepteur sint occaecat cupidatat non proident sunt in culpa qui
        officia deserunt mollit anim id est laborum.{" "}
        <em className={styles.accent}>Lorem ipsum dolor sit amet</em> and
        updated after that through a retainer.
      </>
    ),
  },
];

function StepText({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useTone(ref);
  return (
    <p className={styles.text} data-tone="armed" ref={ref}>
      {children}
    </p>
  );
}

export default function ProcessSummary() {
  const sectionRef = useRef<HTMLElement>(null);
  useSectionProgress(sectionRef);
  useReveals();

  return (
    <section id="process-summary" className={styles.section} aria-labelledby="process-summary-heading" ref={sectionRef}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.head}>
          <h2 id="process-summary-heading" className={styles.heading}>
            Lorem ipsum dolor sit
          </h2>
        </div>
        <div className={styles.body}>
          <ol className={styles.steps}>
            {STEPS.map((s) => (
              <li key={s.label} className={styles.item}>
                <h3 className={styles.label}>{s.label}</h3>
                <div className={styles.content}>
                  <div className={styles.media} data-reveal="tl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={s.alt}
                      loading="lazy"
                      width={1254}
                      height={1254}
                      decoding="async"
                      className={styles.photo}
                      src={s.img}
                    />
                    <span />
                  </div>
                  <StepText>{s.text}</StepText>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
