"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./site-nav.module.css";
import { WordFade, RiseWhole } from "../lib/anim";
import { morphTarget, SETTLED } from "../lib/scroll";

/** SiteNav 1:1 — barra completa arriba, píldora flotante al bajar.
    El morph lo gobierna morphTarget(scrollY, free .28, commit 90) con
    lerp .09/frame (código exacto de la referencia): objetivo 0 arriba,
    0.72 a 90px, 1 a 180px. --nav-p y --nav-shrink van juntos.
    El ancho de la píldora se mide del nav real (con --nav-p=1 y
    --nav-shrink 0/1, sin data-measured para que haga shrink-wrap) y se
    guarda en --nav-settled-0/1 y --links-settled-0/1. Arriba solo se ve
    el glifo "Aa"; al bajar aparece el wordmark "Jafet Pérez".
    --wm-ratio también se mide en runtime (ancho natural del wordmark /
    font-size = 7.3889): el 7.06 del CSS estático deja la marca en
    127.08px y recorta la "i" final; medida queda en 133px.
    Modos de la referencia: "desktop" (píldora con morph por scroll) o
    "panel" (móvil/tablet: barra ancha fija, menú desplegable tipo panel
    con --nav-m/--menu-p en <html>). En modo panel NO se escriben
    --nav-p/--nav-shrink: el CSS los fija a 0 y el morph va por --nav-m
    (max(scroll, menú abierto)). */
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function isFinePointer() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function isWidePortraitTouch() {
  return (
    window.innerWidth >= 1024 &&
    window.innerWidth <= 1100 &&
    window.innerHeight > window.innerWidth &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

function usesPanelMenu() {
  return !isFinePointer() && (window.innerWidth < 1024 || isWidePortraitTouch());
}

type NavMode = "desktop" | "panel" | "none";

function navMode(): NavMode {
  const desktop =
    window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)")
      .matches ||
    (window.matchMedia("(min-width: 1024px) and (pointer: coarse)").matches &&
      !isWidePortraitTouch());
  if (desktop) return "desktop";
  return usesPanelMenu() ? "panel" : "none";
}

export default function SiteNav() {
  const navRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const sheetInnerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  openRef.current = open;
  const [mode, setMode] = useState<NavMode>("desktop");

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      if (!nav.getClientRects().length) return;
      const links = nav.querySelector("[data-nav-links]") as HTMLElement | null;
      const markEl = nav.querySelector(
        'a[aria-label="Jafet Pérez"]',
      ) as HTMLElement | null;
      const wm = markEl?.querySelector(
        `.${styles.wordmark}`,
      ) as HTMLElement | null;
      const wasMeasured = nav.hasAttribute("data-measured");
      const p = nav.style.getPropertyValue("--nav-p");
      const shrink = nav.style.getPropertyValue("--nav-shrink");
      // El settled se mide con el ratio del CSS (7.06), sin el ratio
      // medido: la ref deja --nav-settled-1 en 494.27px y solo después
      // aplica --wm-ratio=7.3889 en la marca. Si se midiera con el ratio
      // ya aplicado, el settled saldría 500.19px y la píldora, 6px ancha.
      const ratio = markEl?.style.getPropertyValue("--wm-ratio") ?? "";
      markEl?.style.removeProperty("--wm-ratio");
      nav.removeAttribute("data-measured");
      nav.style.setProperty("--nav-p", "1");
      const at = (s: string): [number, number] => {
        nav.style.setProperty("--nav-shrink", s);
        return [
          nav.getBoundingClientRect().width,
          links ? links.getBoundingClientRect().width : 0,
        ];
      };
      const [s0, l0] = at("0");
      const [s1, l1] = at("1");
      if (p) nav.style.setProperty("--nav-p", p);
      else nav.style.removeProperty("--nav-p");
      if (shrink) nav.style.setProperty("--nav-shrink", shrink);
      else nav.style.removeProperty("--nav-shrink");
      if (s0 > 0 && l0 > 0 && s1 > 0 && l1 > 0) {
        nav.style.setProperty("--nav-settled-0", `${s0.toFixed(2)}px`);
        nav.style.setProperty("--nav-settled-1", `${s1.toFixed(2)}px`);
        nav.style.setProperty("--links-settled-0", `${l0.toFixed(2)}px`);
        nav.style.setProperty("--links-settled-1", `${l1.toFixed(2)}px`);
        nav.setAttribute("data-measured", "");
      } else if (wasMeasured) {
        nav.setAttribute("data-measured", "");
      }
      // --wm-ratio medido en runtime (la ref lo escribe así: 7.3889, no
      // el 7.06 del CSS estático): ancho natural del wordmark / font-size.
      // Se mide DESPUÉS de --nav-settled-0/1 (ver arriba): el settled se
      // captura con el ratio del CSS (494.27px); el ratio corregido solo
      // ensancha la marca a 133px y el flex del nav absorbe los ~6px en
      // los links (min-inline-size: 0).
      if (markEl && wm) {
        const fs = parseFloat(getComputedStyle(markEl).fontSize);
        const w = wm.offsetWidth;
        if (w > 0 && fs > 0) {
          markEl.style.setProperty("--wm-ratio", (w / fs).toFixed(4));
        } else if (ratio) {
          markEl.style.setProperty("--wm-ratio", ratio);
        }
      }
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    const ro = new ResizeObserver(() => {
      if (!nav.hasAttribute("data-measured")) measure();
    });
    ro.observe(nav);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  // Modo desktop/panel/none (código de la referencia): se recalcula en
  // resize y orientationchange.
  useEffect(() => {
    setMode(navMode());
    let raf = 0;
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setMode(navMode()));
    };
    window.addEventListener("resize", onChange, { passive: true });
    window.addEventListener("orientationchange", onChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  // --sheet-h medido (la ref: inner.offsetHeight + padding-block del
  // SHEET —block-start phone-bar-h + block-end 0—, no del inner).
  useEffect(() => {
    const sheet = sheetRef.current;
    const inner = sheetInnerRef.current;
    if (!sheet || !inner) return;
    const measureSheet = () => {
      if (!usesPanelMenu()) return;
      const s = getComputedStyle(sheet);
      const n =
        parseFloat(s.paddingBlockStart) + parseFloat(s.paddingBlockEnd);
      sheet.style.setProperty(
        "--sheet-h",
        `${Math.round(inner.offsetHeight + n)}px`,
      );
    };
    measureSheet();
    const ro = new ResizeObserver(measureSheet);
    ro.observe(inner);
    window.addEventListener("resize", measureSheet);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureSheet);
    };
  }, []);

  // Morph por scroll SOLO en modo desktop. En modo panel el morph va
  // por --nav-m (ver efecto siguiente) y el CSS fija --nav-p:0.
  useEffect(() => {
    if (mode !== "desktop") return;
    const nav = navRef.current;
    if (!nav) return;
    let current = 0;
    let raf = 0;
    let settled = true;
    const loop = () => {
      const target = morphTarget(window.scrollY, 0.28, 90);
      current += (target - current) * 0.09;
      if (Math.abs(target - current) < SETTLED) {
        current = target;
        settled = true;
      }
      nav.style.setProperty("--nav-p", current.toFixed(4));
      nav.style.setProperty("--nav-shrink", current.toFixed(4));
      if (!settled) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (settled) {
        settled = false;
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      nav.style.removeProperty("--nav-p");
      nav.style.removeProperty("--nav-shrink");
    };
  }, [mode]);

  // Modo panel (móvil/tablet): --nav-m = max(morph por scroll, menú
  // abierto), --menu-p = menú abierto, ambos con lerp .09 en <html>;
  // data-menu-open en <html> y data-anim en el sheet cuando el menú
  // está en progreso. Código de la referencia.
  useEffect(() => {
    if (mode !== "panel") return;
    const root = document.documentElement;
    const sheet = sheetRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let navM = 0;
    let menuP = 0;
    let raf = 0;
    let running = false;
    const apply = () => {
      root.style.setProperty("--nav-m", navM.toFixed(4));
      root.style.setProperty("--menu-p", menuP.toFixed(4));
      const animating = menuP > 1e-4;
      root.toggleAttribute("data-menu-open", animating);
      sheet?.toggleAttribute("data-anim", animating);
    };
    const loop = () => {
      const target = Math.max(
        morphTarget(window.scrollY, 0.28, 90),
        openRef.current ? 1 : 0,
      );
      const menuTarget = openRef.current ? 1 : 0;
      navM += (target - navM) * 0.09;
      menuP += (menuTarget - menuP) * 0.09;
      if (
        Math.abs(target - navM) < SETTLED &&
        Math.abs(menuTarget - menuP) < SETTLED
      ) {
        navM = target;
        menuP = menuTarget;
        running = false;
      }
      apply();
      if (running) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (reduced) {
        navM = Math.max(morphTarget(window.scrollY, 0.28, 90), openRef.current ? 1 : 0);
        menuP = openRef.current ? 1 : 0;
        apply();
        return;
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      root.style.removeProperty("--nav-m");
      root.style.removeProperty("--menu-p");
      root.removeAttribute("data-menu-open");
      sheet?.removeAttribute("data-anim");
    };
  }, [mode, open]);

  return (
    <>
      <nav className={styles.nav} aria-label="Primary" ref={navRef} data-menu-open={open || undefined}>
        <a href="/" className={styles.mark} aria-label="Jafet Pérez">
          <span className={styles.wordmark} aria-hidden="true">
            <span style={{ "--anim-base": "720ms" } as React.CSSProperties}>
              <span className="sr-only">Jafet Pérez</span>
              <WordFade words={["Jafet"]} base="720ms" />
              <span aria-hidden="true"> </span>
              <WordFade words={["Pérez"]} base="720ms" />
            </span>
          </span>
          <RiseWhole base="720ms" riseY="8px">
            <span aria-hidden="true">
              <span className={styles.glyph} aria-hidden="true" />
            </span>
          </RiseWhole>
        </a>

        <div className={styles.links} data-nav-links="">
          <a href="/#work" className={styles.item}>
            <span style={{ "--anim-base": "820ms" } as React.CSSProperties}>
              <span className="sr-only">Work</span>
              <WordFade words={["Work"]} base="820ms" />
            </span>
          </a>
          <a href="/#process-summary" className={styles.item}>
            <span style={{ "--anim-base": "860ms" } as React.CSSProperties}>
              <span className="sr-only">Process</span>
              <WordFade words={["Process"]} base="860ms" />
            </span>
          </a>
          <a
            href="/contact"
            className={styles.cta}
            data-label="Start a project"
            style={{ "--cta-reveal-delay": "900ms" } as React.CSSProperties}
          >
            <span style={{ "--anim-base": "900ms" } as React.CSSProperties}>
              <span className="sr-only">Start a project</span>
              <WordFade words={["Start", "a", "project"]} base="900ms" />
            </span>
            <span className={styles.ctaFill} aria-hidden="true">
              <span style={{ "--anim-base": "900ms" } as React.CSSProperties}>
                <span className="sr-only">Start a project</span>
                <WordFade words={["Start", "a", "project"]} base="900ms" />
              </span>
            </span>
          </a>
        </div>

        <button
          type="button"
          className={styles.burger}
          data-open={open || undefined}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.burgerBox}>
            <span className={styles.burgerLine} />
            <span className={styles.burgerLine} />
          </span>
        </button>
      </nav>

      <div
        className={styles.scrim}
        data-open={open || undefined}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <nav
        className={styles.sheet}
        id="site-menu"
        ref={sheetRef}
        data-open={open || undefined}
        inert={!open || undefined}
        aria-label="Menu"
      >
        <div className={styles.sheetInner} ref={sheetInnerRef}>
          <a href="/#work" className={styles.sheetItem} onClick={() => setOpen(false)}>
            Work
          </a>
          <a href="/#process-summary" className={styles.sheetItem} onClick={() => setOpen(false)}>
            Process
          </a>
          <a href="/contact" className={styles.sheetCta} onClick={() => setOpen(false)}>
            Start a project
          </a>
        </div>
      </nav>
    </>
  );
}
