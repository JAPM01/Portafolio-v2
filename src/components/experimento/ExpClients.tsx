"use client";

import { EXP_CLIENTS, EXP_STRINGS, useExpLang } from "../../lib/exp-content";
import styles from "./exp-clients.module.css";

/**
 * Clientes — clon 1:1 de Melon (medido en vivo, 19 Nov 2026).
 * Melon: retícula de 8 columnas, celda ~232×195 px, logos en gris/blanco
 * con hairlines; la última celda es la invitación ("This spot's open.
 * Let's talk ↗"). Aquí los logos son los nombres en mono (no hay
 * archivos de logo de estos clientes).
 */
export default function ExpClients() {
  const lang = useExpLang();
  const t = EXP_STRINGS.clients;

  return (
    <section className={styles.section} id="exp-clients" aria-labelledby="exp-clients-heading">
      <div className="site-grid">
        <h2 className={"type-h2 " + styles.heading} id="exp-clients-heading">
          {t.heading[lang]}
        </h2>

        <ul className={styles.wall}>
          {EXP_CLIENTS.map((client) => (
            <li className={styles.cell} key={client}>
              <span className={"type-mono " + styles.name}>{client}</span>
            </li>
          ))}
          <li className={styles.cell + " " + styles.ctaCell}>
            <a className={styles.cta} href="mailto:jperez.mond@gmail.com">
              <span className="type-mono">{t.cta[lang]} ↗</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
