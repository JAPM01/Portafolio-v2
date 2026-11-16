import styles from "./work-caption.module.css";

/** Pie de proyecto 1:1 — título, descripción, Year/Role y enlace View
    (con flecha →). En desktop el "View" del pie se oculta y lo muestra
    el cursor flotante; en táctil se ve aquí. */
export default function WorkCaption({
  title,
  line,
  year,
  role,
}: {
  title: string;
  line: string;
  year: string;
  role: string;
}) {
  return (
    <div className={styles.caption}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.line}>{line}</p>
      <div className={styles.facts}>
        <dl className={styles.meta}>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Year</dt>
            <dd className={styles.metaValue}>{year}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaLabel}>Role</dt>
            <dd className={styles.metaValue}>{role}</dd>
          </div>
        </dl>
        <span className={styles.view}>
          <span className={styles.viewLabel}>View</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
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
        </span>
      </div>
    </div>
  );
}
