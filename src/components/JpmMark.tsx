import styles from "./site-nav.module.css";

/** Marca JPM: solo las iniciales, en Google Sans. La altura es la del
    icono de menú (burgerBox: 12px desktop/tablet, 11px en teléfono); el
    ancho puede ser mayor (JPM es más ancho que alto). */
export default function JpmMark() {
  return (
    <svg className={styles.jpm} viewBox="0 0 30 12" aria-hidden="true">
      <text x="0" y="10" fontSize="12" fontWeight="400" letterSpacing="0.02em" fill="currentColor">
        JPM
      </text>
    </svg>
  );
}
