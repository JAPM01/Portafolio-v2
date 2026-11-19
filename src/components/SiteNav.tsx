"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { MorphIcon } from "morphicons/react";
import { ArrowUpRight, Globe, Languages, Menu, X } from "lucide";
import { px } from "../lib/paths";
import styles from "./site-nav.module.css";

// The WebGL liquidGL layer reads the canvas while rendering, so it must not
// be pre-rendered by Next.js during static export.
const HeaderLiquidGL = dynamic(() => import("./HeaderLiquidGL"), { ssr: false });

const LINKS = [
  { href: px("/"), es: "Inicio", en: "Home" },
  { href: px("/experimento"), es: "Versión 2 experimento", en: "Version 2 experiment" },
  { href: px("/contact"), es: "Contacto", en: "Contact" },
] as const;

type Language = "es" | "en";

function subscribeLanguage(listener: () => void) {
  window.addEventListener("site-lang", listener);
  return () => window.removeEventListener("site-lang", listener);
}

function currentLanguage(): Language {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function subscribeScroll(listener: () => void) {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
}

function isScrolled() {
  // On mobile/tablet the header only docks to the bottom once about one
  // grid row of the hero has scrolled out of view (the hero is 100svh
  // with 12 rows, so one row is innerHeight / 12), so the top-to-bottom
  // move is not instantaneous. On desktop the pill appears sooner.
  if (window.innerWidth <= 1023) {
    return window.scrollY > window.innerHeight / 12;
  }
  return window.scrollY > 24;
}

// The hero background is always dark, including when the rest of the site
// is in light mode. Keep controls legible over the actual surface beneath.
function isOverHero() {
  const hero = document.getElementById("hero");
  return !!hero && hero.getBoundingClientRect().bottom > (window.innerWidth <= 480 ? 85 : 100);
}

export default function SiteNav() {
  // Server snapshot stays stable during hydration; actual state is read
  // from the existing <html> attributes once the browser is ready.
  const language = useSyncExternalStore(subscribeLanguage, currentLanguage, () => "es");
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false);
  const overHero = useSyncExternalStore(subscribeScroll, isOverHero, () => false);

  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isSpanish = language === "es";

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  function toggleLanguage() {
    const next: Language = language === "es" ? "en" : "es";
    document.documentElement.lang = next;
    try {
      localStorage.setItem("site-lang", next);
    } catch {
      // The language change remains functional without persistence.
    }
    window.dispatchEvent(new CustomEvent("site-lang", { detail: next }));
  }

  // No glass capsule over the hero at rest. On scroll (or elsewhere on
  // the site), the liquidGL lens refracts the content behind the same nav.
  const showGlass = scrolled || !overHero;

  const navigation = (
          <nav
            className={styles.nav}
            aria-label={isSpanish ? "Navegación principal" : "Main navigation"}
          >
            <a
              className={styles.logo}
              href={px("/")}
              aria-label={isSpanish ? "Jafet Pérez — Inicio" : "Jafet Pérez — Home"}
              onClick={() => setMenuOpen(false)}
            >
              JPM
            </a>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={toggleLanguage}
                aria-label={isSpanish ? "Cambiar idioma a inglés" : "Switch language to Spanish"}
                title={isSpanish ? "ES · Switch to English" : "EN · Cambiar a español"}
              >
                {/* Morphs on press so the language change has visible
                    feedback (the static Globe never changed): Globe while
                    the site is in Spanish, Languages once it is in
                    English. The title still names the target language. */}
                <MorphIcon icon={isSpanish ? Globe : Languages} size={22} strokeWidth={1.9} reducedMotion="user" />
              </button>
              {/* Sin icono de tema: el sitio queda fijo en oscuro, que es
                  su paleta final. Quedan solo el icono de idioma y el
                  menú. */}
              <span className={styles.divider} aria-hidden="true" />
              <button
                ref={menuButtonRef}
                type="button"
                className={styles.iconButton + (menuOpen ? " " + styles.active : "")}
                aria-controls="jpm-navigation-menu"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-label={
                  menuOpen
                    ? isSpanish ? "Cerrar menú" : "Close menu"
                    : isSpanish ? "Abrir menú" : "Open menu"
                }
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MorphIcon
                  icon={menuOpen ? X : Menu}
                  size={24}
                  strokeWidth={1.9}
                  reducedMotion="user"
                />
              </button>
            </div>
          </nav>
  );

  return (
    <header
      className={styles.header + (scrolled ? " " + styles.scrolled : "") + (overHero ? " " + styles.overHero : "") + (!showGlass ? " " + styles.heroResting : "")}
      ref={headerRef}
      data-liquid-ignore=""
    >
      <div className={styles.glassStage}>
        <HeaderLiquidGL active={showGlass}>{navigation}</HeaderLiquidGL>
      </div>

      <div id="jpm-navigation-menu" className={styles.dropdown} hidden={!menuOpen}>
        <nav aria-label={isSpanish ? "Menú de navegación" : "Navigation menu"}>
          {LINKS.map((link, index) => (
            <a
              className={styles.menuLink}
              href={link.href}
              key={link.href}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.menuNumber}>0{index + 1}</span>
              <span>{language === "es" ? link.es : link.en}</span>
              <MorphIcon icon={ArrowUpRight} size={17} strokeWidth={1.75} reducedMotion="user" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
