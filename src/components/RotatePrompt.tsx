"use client";

/** RotatePrompt 1:1 — overlay "Please rotate your phone", visible solo en
    móvil apaisado con poca altura (ref: pointer coarse + landscape +
    max-height 480px). Sin JS: la visibilidad la gobiernan las media queries. */
import styles from "./rotate-prompt.module.css";

export default function RotatePrompt() {
  return (
    <div className={styles.prompt} data-theme="dark">
      <span className={styles.icon} aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          color="currentColor"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            d="M13.5 2H10.5C8.14298 2 6.96447 2 6.23223 2.73223C5.5 3.46447 5.5 4.64298 5.5 7V17C5.5 19.357 5.5 20.5355 6.23223 21.2678C6.96447 22 8.14298 22 10.5 22H13.5C15.857 22 17.0355 22 17.7678 21.2678C18.5 20.5355 18.5 19.357 18.5 17V7C18.5 4.64298 18.5 3.46447 17.7678 2.73223C17.0355 2 15.857 2 13.5 2Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
          <path
            d="M12.125 19H12M12.25 19C12.25 19.1381 12.1381 19.25 12 19.25C11.8619 19.25 11.75 19.1381 11.75 19C11.75 18.8619 11.8619 18.75 12 18.75C12.1381 18.75 12.25 18.8619 12.25 19Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </span>
      <p className={styles.title}>Please rotate your phone</p>
    </div>
  );
}
