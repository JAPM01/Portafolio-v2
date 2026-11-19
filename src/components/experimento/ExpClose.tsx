"use client";

import { EXP_EMAIL, EXP_LINKEDIN, EXP_STRINGS, useExpLang, usePachucaTime } from "../../lib/exp-content";
import styles from "./exp-close.module.css";

/**
 * Contacto + Footer — clon 1:1 TOTAL de Melon (medido en vivo, 19 Nov 2026).
 * Melon: contacto en crema con correo gigante (~150px) en negro; footer
 * oscuro con 3 zonas (Services, Social, Listening & Reading), logo grande
 * y barra inferior en mono. El footer de Tom (letra "JP" + wordmark en
 * marquee) viene DESPUÉS del clon exacto.
 */
export default function ExpClose() {
  const lang = useExpLang();
  const t = EXP_STRINGS.contact;
  const f = EXP_STRINGS.footer;
  const time = usePachucaTime();

  return (
    <>
      <section className={styles.contact} id="exp-contact" aria-labelledby="exp-contact-heading">
        <div className="site-grid">
          <p className={"type-mono " + styles.label + " " + styles.ink}>{t.label[lang]}</p>
          <h2 className={"type-h2 " + styles.heading + " " + styles.ink} id="exp-contact-heading">
            {t.heading[lang]}
          </h2>

          <a className={"type-h2 " + styles.email + " " + styles.ink} href={"mailto:" + EXP_EMAIL}>
            jperez.mond@
            <wbr />
            gmail.com
          </a>

          <div className={styles.metaRow}>
            <p className={"type-mono " + styles.ink}>
              <span className={styles.openDot} aria-hidden="true" /> {t.available[lang]}
            </p>
            <p className={"type-mono " + styles.ink}>{t.location[lang]}</p>
            <a className={styles.social + " " + styles.ink} href={EXP_LINKEDIN} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer} id="exp-footer">
        <div className="site-grid">
          <div className={styles.zone}>
            <p className="type-mono">{lang === "es" ? "Servicios" : "Services"}</p>
            <ul className={styles.serviceList}>
              <li className="type-body">Product Design</li>
              <li className="type-body">UX / UI</li>
              <li className="type-body">Branding</li>
            </ul>
          </div>

          <div className={styles.zone}>
            <p className="type-mono">{f.linkedin[lang]}</p>
            <a className={"type-body " + styles.value} href={EXP_LINKEDIN} target="_blank" rel="noreferrer">
              @jafetperezmondragon
            </a>
          </div>

          <div className={styles.zone}>
            <p className="type-mono">{f.listening[lang]}</p>
            <ul className={styles.serviceList}>
              <li className="type-body">{f.listening1[lang]}</li>
              <li className="type-body">{f.listening2[lang]}</li>
            </ul>
          </div>

          <p className={styles.wordmark}>Jafet Pérez</p>
        </div>

        <div className={styles.bar}>
          <p className="type-mono">© 2026 Jafet Pérez · {f.rights[lang]}</p>
          <p className="type-mono">Pachuca, Hidalgo — {time}</p>
          <a className={styles.top} href="#exp-hero">
            {f.backTop[lang]} ↑
          </a>
        </div>
      </footer>
    </>
  );
}
