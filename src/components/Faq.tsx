"use client";

import { useState } from "react";
import styles from "./faq.module.css";

/** Before you email me 1:1 — acordeón de 6 preguntas. El signo + gira
    a − al abrir (0.32s); el panel crece con grid-template-rows. */
const ITEMS = [
  {
    q: "Lorem ipsum dolor sit amet?",
    a: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.",
  },
  {
    q: "Lorem ipsum dolor?",
    a: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation.",
  },
  {
    q: "Lorem ipsum dolor sit amet consectetur?",
    a: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo.",
  },
  {
    q: "Lorem ipsum dolor sit amet elit?",
    a: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    q: "Lorem ipsum dolor sit amet?",
    a: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore.",
  },
  {
    q: "Lorem ipsum dolor sit amet consectetur adipiscing elit?",
    a: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
  },
];

function Sign() {
  return (
    <span className={styles.sign} aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.5"
        stroke="currentColor"
        className={styles.signBar}
      >
        <path d="M20 12L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.5"
        stroke="currentColor"
        className={`${styles.signBar} ${styles.signPivot}`}
      >
        <path d="M20 12L4 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div className={`container-indent ${styles.grid}`}>
        <h2 id="faq-heading" className={styles.heading}>
          Lorem ipsum dolor sit
        </h2>
        <div className={styles.list}>
          {ITEMS.map((it, k) => (
            <div key={it.q} className={styles.item} data-open={open === k ? "" : undefined}>
              <h3 className={styles.term}>
                <button
                  type="button"
                  className={styles.trigger}
                  data-faq-trigger=""
                  aria-expanded={open === k}
                  aria-controls={`faq-panel-${k}`}
                  onClick={() => setOpen(open === k ? null : k)}
                >
                  <span className={styles.q}>{it.q}</span>
                  <Sign />
                </button>
              </h3>
              <div className={styles.panel} data-faq-panel="" id={`faq-panel-${k}`}>
                <div className={styles.panelInner}>
                  <p className={styles.a} data-faq-answer="">
                    {it.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
