"use client";

import { useRef } from "react";
import styles from "./capabilities.module.css";
import { useTone } from "../lib/scroll";

/** What a project includes 1:1 — título a la izquierda, párrafo
    (32px, gris) a la derecha, grid 39/61. Las frases en <em> son los
    acentos: grises en "armed", negras al entrar al viewport (tono "in"
    → "done", transición 1.1s). */
export default function Capabilities() {
  const copyRef = useRef<HTMLParagraphElement>(null);
  useTone(copyRef);

  return (
    <section id="capabilities" className={styles.section} aria-labelledby="capabilities-heading">
      <div className={`container site-grid ${styles.grid}`}>
        <h2 id="capabilities-heading" className={styles.heading}>
          Lorem ipsum dolor sit
        </h2>
        <p id="capabilities-copy" className={styles.copy} data-tone="armed" ref={copyRef}>
          Lorem ipsum dolor sit amet consectetur{" "}
          <em className={styles.accent}>adipiscing elit sed</em> do eiusmod
          tempor incididunt ut labore et dolore magna{" "}
          <em className={styles.accent}>aliqua enim</em> ad minim veniam
          quis nostrud{" "}
          <em className={styles.accent}>exercitation ullamco laboris</em>{" "}
          nisi aliquip ex ea commodo consequat duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla <em className={styles.accent}>pariatur</em>.
        </p>
      </div>
    </section>
  );
}
