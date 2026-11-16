"use client";

import { useRef } from "react";
import styles from "./why.module.css";
import { useTone } from "../lib/scroll";

/** Why I do this 1:1 — mismo layout 39/61 que Capabilities/Terms,
    párrafo 21px con acentos y tono armed → in → done. */
export default function Why() {
  const copyRef = useRef<HTMLParagraphElement>(null);
  useTone(copyRef);

  return (
    <section id="why" className={styles.section} aria-labelledby="why-heading">
      <div className={`container ${styles.grid}`}>
        <h2 id="why-heading" className={styles.heading}>
          Lorem ipsum dolor sit
        </h2>
        <p id="why-copy" className={styles.copy} data-tone="armed" ref={copyRef}>
          Lorem ipsum dolor sit amet consectetur adipiscing elit sed do
          eiusmod tempor incididunt ut labore et dolore magna{" "}
          <em className={styles.accent}>aliqua enim ad minim</em> veniam
          quis nostrud exercitation ullamco laboris nisi aliquip ex ea
          commodo consequat duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur
          excepteur sint occaecat cupidatat non proident sunt in culpa qui
          officia deserunt mollit anim id est laborum lorem ipsum dolor sit
          amet consectetur adipiscing elit sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua enim ad minim veniam quis
          nostrud exercitation ullamco laboris nisi aliquip ex ea commodo
          consequat duis aute irure dolor in reprehenderit.
        </p>
      </div>
    </section>
  );
}
