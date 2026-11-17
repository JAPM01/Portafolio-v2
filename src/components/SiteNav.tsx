"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { MorphIcon } from "morphicons/react";
import { ArrowUpRight, Globe, Menu, Moon, Sun, X } from "lucide";
import { px } from "../lib/paths";
import styles from "./site-nav.module.css";
import {
  getHeaderPreview,
  getServerHeaderPreview,
  hydrateHeaderPreview,
  subscribeHeaderPreview,
} from "../lib/header-preview";

// The WebGL liquidGL layer reads the canvas while rendering, so it must not
// be pre-rendered by Next.js during static export.
const LiquidGlass = dynamic(() => import("liquid-glass-react"), { ssr: false });
const HeaderLiquidGL = dynamic(() => import("./HeaderLiquidGL"), { ssr: false });

const LINKS = [
  { href: px("/"), es: "Inicio", en: "Home" },
  { href: px("/#work"), es: "Proyectos", en: "Work" },
  { href: px("/#process-summary"), es: "Proceso", en: "Process" },
  { href: px("/contact"), es: "Contacto", en: "Contact" },
] as const;

type Language = "es" | "en";
type Theme = "dark" | "light";

function subscribeLanguage(listener: () => void) {
  window.addEventListener("site-lang", listener);
  return () => window.removeEventListener("site-lang", listener);
}

function currentLanguage(): Language {
  return document.documentElement.lang === "en" ? "en" : "es";
}

function subscribeTheme(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribeScroll(listener: () => void) {
  window.addEventListener("scroll", listener, { passive: true });
  return () => window.removeEventListener("scroll", listener);
}

function isScrolled() {
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
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "dark");
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => false);
  const overHero = useSyncExternalStore(subscribeScroll, isOverHero, () => false);
  const headerPreview = useSyncExternalStore(
    subscribeHeaderPreview,
    getHeaderPreview,
    getServerHeaderPreview
  );

  useEffect(() => {
    hydrateHeaderPreview();
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  // The upstream library only listens to mousemove. Feed touch contact
  // coordinates to its external pointer API so the pill can deform on Android.
  const [touchPoint, setTouchPoint] = useState<{
    global: { x: number; y: number };
    offset: { x: number; y: number };
  } | null>(null);
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

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("site-theme", next);
    } catch {
      // The theme change remains functional without persistence.
    }
  }

  // No glass capsule over the hero at rest. On scroll (or elsewhere on
  // the site), mount the actual LiquidGlass component around the same nav.
  const showGlass = scrolled || !overHero;
  function trackTouch(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || !showGlass) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setTouchPoint({
      global: { x: event.clientX, y: event.clientY },
      offset: {
        x: ((event.clientX - centerX) / rect.width) * 100,
        y: ((event.clientY - centerY) / rect.height) * 100,
      },
    });
  }

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
                <MorphIcon icon={Globe} size={22} strokeWidth={1.9} reducedMotion="user" />
              </button>
              <button
                type="button"
                className={styles.iconButton}
                onClick={toggleTheme}
                aria-label={
                  theme === "light"
                    ? isSpanish ? "Activar modo oscuro" : "Enable dark mode"
                    : isSpanish ? "Activar modo claro" : "Enable light mode"
                }
                title={theme === "light" ? "Dark mode" : "Light mode"}
              >
                <MorphIcon
                  icon={theme === "light" ? Moon : Sun}
                  size={22}
                  strokeWidth={1.9}
                  reducedMotion="user"
                />
              </button>
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
      <div
        className={styles.glassStage}
        onPointerDown={trackTouch}
        onPointerUp={() => setTouchPoint(null)}
        onPointerCancel={() => setTouchPoint(null)}
      >
        {headerPreview === "header1" ? (
          <HeaderLiquidGL active={showGlass}>{navigation}</HeaderLiquidGL>
        ) : !showGlass ? (
          navigation
        ) : (
          <LiquidGlass
            displacementScale={400}
            mode="prominent"
            aberrationIntensity={6.0}
            saturation={180}
            blurAmount={0}
            cornerRadius={18}
            padding="0px"
            className={styles.liquidGlass}
            style={{ position: "absolute", top: "50%", left: "50%", width: "100%", height: "100%" }}
            globalMousePos={touchPoint?.global}
            mouseOffset={touchPoint?.offset}
          >
            {navigation}
          </LiquidGlass>
        )}
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
