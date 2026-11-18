"use client";

import { useRef } from "react";
import styles from "./terms.module.css";
import { useSectionProgress, useTone } from "../lib/scroll";

/** What it costs 1:1 — título a la izquierda, párrafo (21px, gris) a
    la derecha, grid 39/61, con acentos y tono armed → in → done. */
export default function Terms() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  useSectionProgress(sectionRef);
  useTone(copyRef);

  return (
    <section id="terms" className={styles.section} aria-labelledby="terms-heading" ref={sectionRef}>
      <div className={`container site-grid ${styles.grid}`}>
        <h2 id="terms-heading" className={styles.heading}>
          Lorem ipsum dolor
        </h2>
        <p id="terms-copy" className={styles.copy} data-tone="armed" ref={copyRef}>
          Lorem ipsum{" "}
          <em className={styles.accent}>dolor sit amet</em>, consectetur
          adipiscing elit sed do eiusmod tempor incididunt ut labore et
          dolore magna aliqua enim ad minim veniam quis nostrud exercitation
          ullamco laboris nisi aliquip ex ea commodo consequat duis aute
          irure dolor in reprehenderit in voluptate velit esse cillum dolore
          eu fugiat nulla pariatur excepteur sint occaecat cupidatat non
          proident sunt in culpa qui officia deserunt mollit anim id est
          laborum. Lorem ipsum dolor sit amet consectetur adipiscing elit
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
          enim ad minim veniam quis nostrud exercitation ullamco laboris
          nisi aliquip ex ea commodo consequat duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur.
        </p>
      </div>
    </section>
  );
}
