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
 * Contacto + Footer — clon 1:1 de Melon (CSS capturado, 19 Nov 2026):
 * Contacto data-tone="black": FONDO NEGRO, correo gigante BLANCO,
 * 300 clamp(2.6rem, 8vw, 9.5rem)/.95, LS -.055em = 152px / 36.7px,
 * padding-bottom .1em, subrayado animado; "Start a project" es
 * .f-showall (roll + doble flecha SVG), margin-top 5vh. Sin SVG de
 * onda (Melon no lo tiene). Resplandor rojo difuminado detrás del
 * lado derecho del correo. Padding 22.5vh 0 3vh (móvil 7.5vh/10.5vh).
 * Footer: columnas Contact 1/5, Social 5/7, Listening 7/−1; cols flex
 * column gap 24, grid-row 1; labels 500 12px/16px mono, muted; CTA
 * "Open to new projects." 300 clamp(1.75rem, 2.3vw, 2.5rem)/1.05,
 * LS -.035em, gap 14, punto 9px rojo con halo; lista gap 10; enlaces
 * 400 20px/1.3, LS -.015em, nowrap, padding-bottom 3px, flecha SVG.
 * Listening: covers generadas 104px aspect 3/4 radio 3px; kicker 500
 * 12px/16 mono con ecualizador animado en Now playing; título 400
 * 22px/1.15, LS -.02em, nowrap ellipsis; by 400 15px/1.3, ink 86%.
 * Fila inferior: logo grid 1/5 clamp(160px, 19vw, 330px); where 5/7;
 * copy + legal 7/−1 (legal: 500 12px/16 mono, gap 8px 24px, incluye
 * botón "Cookie settings"). Padding del footer: 13vh arriba, 48px abajo.
 */
export default function ExpClose() {
  const t = EXP_STRINGS.contact;
  const f = EXP_STRINGS.footer;
  const time = usePoznanTime();
  // Offset de Poznań (UTC+1 en invierno, UTC+2 en verano), como Melon.
  const offset = (() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Warsaw",
      timeZoneName: "shortOffset",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
    return tz.replace("GMT", "UTC");
  })();

  return (
    <>
      <section className={styles.contact} id="exp-contact" aria-labelledby="exp-contact-heading">
        <div className="site-grid">
          <h2 className="sr-only" id="exp-contact-heading">
            Contact
          </h2>

          <div className={styles.glow} aria-hidden="true" />
          <a className={"type-h2 " + styles.email} href={"mailto:" + EXP_EMAIL}>
            hello@melon.studio
          </a>

          <a className={"type-mono " + styles.startProject} href={t.startProjectHref}>
            <span className={styles.roll}>
              <span>{t.startProject}</span>
              <span aria-hidden="true">{t.startProject}</span>
            </span>
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
              <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 8h9M19 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </a>
        </div>
      </section>

      <footer className={styles.footer} id="exp-footer">
        <div className="site-grid">
          <div className={styles.zone + " " + styles.zoneContact}>
            <p className={"type-mono " + styles.label}>{f.contact}</p>
            <p className={"type-body " + styles.cta}>
              <span className={styles.openDot} aria-hidden="true" />
              Open to new projects.
            </p>
            <div className={styles.servicesBlock}>
              <p className={"type-mono " + styles.label}>{f.services}</p>
              <ul className={styles.serviceList}>
                {EXP_SERVICES.map((service) => (
                  <li key={service.label}>
                    <a className={"type-body " + styles.value} href={service.href}>
                      {service.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.zone + " " + styles.zoneSocial}>
            <p className={"type-mono " + styles.label}>{f.social}</p>
            <ul className={styles.serviceList}>
              {EXP_SOCIAL.map((social) => (
                <li key={social.label}>
                  <a className={"type-body " + styles.value} href={social.href} target="_blank" rel="noreferrer">
                    {social.label}
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 13L13 3M5 3h8v8" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.zone + " " + styles.zoneListening}>
            <p className={"type-mono " + styles.label}>{f.listening}</p>
            <div className={styles.listenList}>
              <div className={styles.nowItem}>
                <div className={styles.cover + " " + styles.coverRed} aria-hidden="true">
                  <span className={"type-mono " + styles.coverBy}>{EXP_LISTENING.nowPlaying.by}</span>
                  <span className={"type-mono " + styles.coverTitle}>{EXP_LISTENING.nowPlaying.title}</span>
                </div>
                <div className={styles.nowText}>
                  <p className={"type-mono " + styles.kicker}>
                    <span className={styles.eq} aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    {f.nowPlaying}
                  </p>
                  <a
                    className={"type-body " + styles.listenTitle}
                    href={EXP_LISTENING.nowPlaying.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {EXP_LISTENING.nowPlaying.title}
                  </a>
                  <p className={"type-body " + styles.by}>{EXP_LISTENING.nowPlaying.by}</p>
                </div>
              </div>
              <div className={styles.nowItem}>
                <div className={styles.cover + " " + styles.coverDark} aria-hidden="true">
                  <span className={"type-mono " + styles.coverBy}>{EXP_LISTENING.reading.by}</span>
                  <span className={"type-mono " + styles.coverTitle}>{EXP_LISTENING.reading.title}</span>
                </div>
                <div className={styles.nowText}>
                  <p className={"type-mono " + styles.kicker}>{f.reading}</p>
                  <a
                    className={"type-body " + styles.listenTitle}
                    href={EXP_LISTENING.reading.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {EXP_LISTENING.reading.title}
                  </a>
                  <p className={"type-body " + styles.by}>{EXP_LISTENING.reading.by}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.footDivider} aria-hidden="true" />
          <img className={styles.footLogo} src={EXP_LOGO_FOOTER} alt="melon studio" />
          <p className={"type-mono " + styles.where}>
            {time} {offset} Poznań, Poland
          </p>
          <div className={styles.footRight}>
            <p className={"type-mono " + styles.copy}>© 2026 melon studio</p>
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
              <button className="type-mono" type="button">
                Cookie settings
              </button>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
