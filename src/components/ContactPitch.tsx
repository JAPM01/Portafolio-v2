"use client";

import { useState } from "react";
import styles from "./contact-page.module.css";
import closeStyles from "../components/contact-close.module.css";

/** Página /contact 1:1 — reutiliza ContactClose con el nombre
    "Contact", la dirección de email y los botones Email me / Copy. */

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 21.1213 20.2426 19.5607 20.2426C18 20.2426 17.2929 20.2426 16.1213 19.5607" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 4.43934 2.43934C4 2.87868 4 3.58579 4 5V15C4 16.4142 4 17.1213 4.43934 17.5607C4.87868 18 5.58579 18 7 18H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path d="M5 14L8.5 17.5L19 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function CopyButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText("jperez.mond@gmail.com");
    } catch {
      /* El portapapeles puede no estar disponible; el estado cambia igual. */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      className={styles.copy}
      data-copied={copied ? "" : undefined}
      onClick={copy}
      aria-label="Copy email address"
    >
      <span className={styles.swap}>
        <span className={`${styles.state} ${styles.stateIdle}`}>
          Copy
          <CopyIcon />
        </span>
        <span className={`${styles.state} ${styles.stateDone}`} aria-hidden="true">
          Copied
          <CheckIcon />
        </span>
      </span>
      <span className={styles.copyFill} aria-hidden="true">
        <span className={styles.swap}>
          <span className={`${styles.state} ${styles.stateIdle}`}>
            Copy
            <CopyIcon />
          </span>
          <span className={`${styles.state} ${styles.stateDone}`} aria-hidden="true">
            Copied
            <CheckIcon />
          </span>
        </span>
      </span>
    </button>
  );
}

export default function ContactPitch() {
  return (
    <div className={styles.email}>
      <p className={styles.address} translate="no">
        jperez.mond@gmail.com
      </p>
      <div className={styles.actions}>
          <a
            className={`${closeStyles.cta} ${styles.mailto}`}
            href="mailto:jperez.mond@gmail.com?subject=New%20Project"
          >
            Email me
          </a>
          <div className={styles.copyWrap}>
            <CopyButton />
          </div>
        </div>
      <span className={styles.status} role="status" />
    </div>
  );
}
