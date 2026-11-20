"use client";

import {
  EXP_EMAIL,
  EXP_LISTENING,
  EXP_LOGO_FOOTER,
  EXP_SERVICES,
  EXP_SOCIAL,
  EXP_STRINGS,
  MELON_BASE,
  usePoznanTime,
} from "../../lib/exp-content";
import styles from "./exp-close.module.css";

/**
 * Contacto + Footer — clon 1:1 TOTAL de Melon (medido en vivo, 19 Nov 2026).
 * Melon: contacto en crema con solo el correo gigante en negro +
 * "Start a project →" (sin etiqueta ni título visibles); footer oscuro
 * con 3 zonas (Contact + Services, Social, Listening & Reading), logo
 * grande y barra inferior en mono (logo, hora + Poznań, ©, Privacy /
 * Cookies / Terms / Polski).
 */
export default function ExpClose() {
  const t = EXP_STRINGS.contact;
  const f = EXP_STRINGS.footer;
  const time = usePoznanTime();

  return (
    <>
      <section className={styles.contact} id="exp-contact" aria-labelledby="exp-contact-heading">
        <div className="site-grid">
          <h2 className="sr-only" id="exp-contact-heading">
            Contact
          </h2>

          <a className={"type-h2 " + styles.email + " " + styles.ink} href={"mailto:" + EXP_EMAIL}>
            hello@melon.studio
          </a>

          <a className={"type-mono " + styles.startProject + " " + styles.ink} href={t.startProjectHref}>
            {t.startProject} →
          </a>
        </div>
      </section>

      <footer className={styles.footer} id="exp-footer">
        <div className="site-grid">
          <div className={styles.zone}>
            <p className="type-mono">{f.contact}</p>
            <p className={"type-body " + styles.cta}>
              <span className={styles.openDot} aria-hidden="true" /> Open to new projects.
            </p>
            <p className="type-mono">{f.services}</p>
            <ul className={styles.serviceList}>
              {EXP_SERVICES.map((service) => (
                <li key={service.label}>
                  <a className={"type-body " + styles.value} href={service.href} target="_blank" rel="noreferrer">
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.zone}>
            <p className="type-mono">{f.social}</p>
            <ul className={styles.serviceList}>
              {EXP_SOCIAL.map((social) => (
                <li key={social.label}>
                  <a className={"type-body " + styles.value} href={social.href} target="_blank" rel="noreferrer">
                    {social.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.zone}>
            <p className="type-mono">{f.listening}</p>
            <div className={styles.nowItem}>
              <p className="type-mono">{f.nowPlaying}</p>
              <a
                className={"type-body " + styles.value}
                href={EXP_LISTENING.nowPlaying.href}
                target="_blank"
                rel="noreferrer"
              >
                {EXP_LISTENING.nowPlaying.title}
              </a>
              <p className="type-body">{EXP_LISTENING.nowPlaying.by}</p>
            </div>
            <div className={styles.nowItem}>
              <p className="type-mono">{f.reading}</p>
              <a
                className={"type-body " + styles.value}
                href={EXP_LISTENING.reading.href}
                target="_blank"
                rel="noreferrer"
              >
                {EXP_LISTENING.reading.title}
              </a>
              <p className="type-body">{EXP_LISTENING.reading.by}</p>
            </div>
          </div>
        </div>

        <div className={styles.footRow}>
          <img className={styles.footLogo} src={EXP_LOGO_FOOTER} alt="melon studio" width={110} height={50} />
          <p className="type-mono">
            {time} Poznań, Poland
          </p>
          <p className="type-mono">© 2026 melon studio</p>
          <nav className={styles.legal} aria-label="Legal">
            <a className="type-mono" href={MELON_BASE + "/privacy"}>
              Privacy
            </a>
            <a className="type-mono" href={MELON_BASE + "/cookies"}>
              Cookies
            </a>
            <a className="type-mono" href={MELON_BASE + "/terms"}>
              Terms
            </a>
            <a className="type-mono" href={MELON_BASE + "/pl"}>
              Polski
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
