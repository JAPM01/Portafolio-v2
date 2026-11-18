import styles from "./site-nav.module.css";

/** Marca JPM: solo las iniciales, en Google Sans. La altura es 20px,
    igual que los iconos (globo/sol: 20px); el ancho puede ser mayor
    (JPM es más ancho que alto). */
export default function JpmMark() {
  return (
    <svg className={styles.jpm} viewBox="0 0 50 20" aria-hidden="true">
      <text x="0" y="16" fontSize="var(--type-body-size)" fontWeight="400" letterSpacing="0.02em" fill="currentColor">
        JPM
      </text>
    </svg>
  );
}
