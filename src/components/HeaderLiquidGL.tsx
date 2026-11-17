"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import type { LiquidGLLens } from "liquid-gl";
import { setHeaderPreviewStatus } from "../lib/header-preview";
import styles from "./site-nav.module.css";

/** Sample the exact body snapshot that liquidGL refracts. A single global
 * light/dark theme does not describe the surfaces crossed while scrolling.
 * Sample the left and right controls independently to preserve contrast. */
function updateControlContrast(
  lens: LiquidGLLens | undefined,
  target: HTMLDivElement | null,
  previous: { logo: boolean; actions: boolean }
) {
  const renderer = lens?.renderer;
  const bitmap = renderer?.staticSnapshotCanvas;
  const anchor = target?.closest("header");
  const scale = renderer?.scaleFactor ?? 1;
  if (!bitmap || !anchor || !Number.isFinite(scale) || scale <= 0) return;
  const rect = anchor.getBoundingClientRect();
  const captureRect = document.body.getBoundingClientRect();
  if (!rect.width || !rect.height || !bitmap.width || !bitmap.height) return;

  try {
    const ctx = bitmap.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const measure = (fractions: number[]) => {
      const values: number[] = [];
      for (const x of fractions) {
        for (const y of [0.28, 0.52, 0.72]) {
          const px = Math.floor((rect.left + x * rect.width - captureRect.left) * scale);
          const py = Math.floor((rect.top + y * rect.height - captureRect.top) * scale);
          if (px < 0 || px >= bitmap.width || py < 0 || py >= bitmap.height) continue;
          const rgba = ctx.getImageData(px, py, 1, 1).data;
          // The rasterized body is sRGB and includes the page background.
          const lum = (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) / 255;
          values.push(lum);
        }
      }
      if (!values.length) return undefined;
      values.sort((a, b) => a - b);
      return values[Math.floor(values.length / 2)];
    };

    const assign = (name: "logo" | "actions", value: number | undefined) => {
      if (value === undefined) return;
      // Hysteresis avoids flickering between icon colors at a boundary.
      const bright = previous[name] ? value > 0.52 : value > 0.63;
      if (previous[name] === bright && anchor.style.getPropertyValue(
        name === "logo" ? "--header-logo-foreground" : "--header-actions-foreground"
      )) return;
      previous[name] = bright;
      anchor.style.setProperty(
        name === "logo" ? "--header-logo-foreground" : "--header-actions-foreground",
        bright ? "var(--brand-gray-2)" : "var(--brand-gray-7)"
      );
    };
    assign("logo", measure([0.06, 0.12, 0.19, 0.25]));
    assign("actions", measure([0.69, 0.77, 0.84, 0.91, 0.96]));
  } catch {
    // A tainted canvas or restricted readback must not disable navigation.
    // The existing theme-based foreground remains as a safe fallback.
  }
}

/** Single GPU lens. Refract smoothly, keep text legible and avoid expensive
 * whole-document re-rasterization on every scroll event. */
export default function HeaderLiquidGL({
  children,
  active,
}: {
  children: ReactNode;
  active: boolean;
}) {
  const lensRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const lensInstanceRef = useRef<LiquidGLLens | undefined>(undefined);

  useEffect(() => {
    activeRef.current = active;
    if (!active) {
      lensRef.current?.closest("header")?.style.removeProperty("--header-logo-foreground");
      lensRef.current?.closest("header")?.style.removeProperty("--header-actions-foreground");
    }
  }, [active]);

  useEffect(() => {
    let mounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let geometryTimer: ReturnType<typeof setTimeout> | null = null;
    let toneFrame: number | null = null;
    const tone = { logo: false, actions: false };
    const scheduleTone = () => {
      if (!mounted || !activeRef.current || toneFrame !== null) return;
      toneFrame = requestAnimationFrame(() => {
        toneFrame = null;
        if (mounted && activeRef.current) {
          updateControlContrast(lensInstanceRef.current, lensRef.current, tone);
        }
      });
    };

    const refresh = (delay: number) => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(async () => {
        if (!mounted || !lensInstanceRef.current?.renderer) return;
        try {
          await lensInstanceRef.current.renderer.captureSnapshot();
          scheduleTone();
        } catch {
          // Continue using the last valid snapshot and colors.
        }
      }, delay);
    };

    const reportGeometry = (lens: LiquidGLLens | undefined) => {
      if (!mounted || !activeRef.current || !lens) return;
      const rect = lensRef.current?.getBoundingClientRect();
      const gpu = lens.rectPx;
      const delta = rect && gpu
        ? Math.max(
            Math.abs(rect.left - gpu.left),
            Math.abs(rect.top - gpu.top),
            Math.abs(rect.width - gpu.width),
            Math.abs(rect.height - gpu.height)
          )
        : null;
      const backend = lens.renderer?.backend?.constructor?.name || "motor no identificado";
      const scale = lens.renderer?.scaleFactor;
      setHeaderPreviewStatus(
        "liquidGL: " + backend +
        (typeof scale === "number" ? " · captura " + scale.toFixed(2) + "x" : "") +
        (delta !== null ? " · geometría Δ" + delta.toFixed(1) + "px" : "")
      );
    };
    const scheduleGeometry = () => {
      if (geometryTimer) clearTimeout(geometryTimer);
      geometryTimer = setTimeout(() => {
        const lens = lensInstanceRef.current;
        if (!mounted || !activeRef.current || !lens) return;
        // Header width transitions end before measuring; synchronize the
        // shader geometry without refreshing the entire body texture.
        lens.updateMetrics?.();
        lens.renderer?.render?.();
        reportGeometry(lens);
      }, 360);
    };
    // Scroll changes geometry; it does not require re-rasterizing the body.
    const onScroll = () => {
      scheduleTone();
      scheduleGeometry();
    };
    const onResize = () => {
      scheduleTone();
      scheduleGeometry();
      refresh(700);
    };
    const onLanguage = () => refresh(450);
    const themeObserver = new MutationObserver(() => refresh(500));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "lang"],
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("site-lang", onLanguage);

    setHeaderPreviewStatus("Inicializando refracción");
    import("liquid-gl")
      .then(({ default: liquidGL }) => {
        if (!mounted || !lensRef.current) return;
        const result = liquidGL({
          target: "#jpm-preview-header1-lens",
          snapshot: "body",
          engine: window.innerWidth < 768 ? "webgl2" : "auto",
          resolution: window.innerWidth < 768 ? 1.25 : 1.6,
          // Header stacking context is z=9999; the GPU canvas is local z=1,
          // under the navigation at local z=3.
          zIndex: 10001,
          content: false,
          // Physical lens-relative displacement: ~4.3px maximum for 62px
          // mobile glass; high-contrast glyph guard remains enabled.
          refraction: 0.024,
          aberration: 0,
          bevelDepth: 0.046,
          bevelWidth: 0.15,
          frost: 0,
          shadow: false,
          specular: true,
          reveal: "none",
          draggable: false,
          tilt: false,
          interaction: "fluid",
          interactionStrength: 0.22,
          interactionRadius: 0.35,
          interactionViscosity: 0.65,
          magnify: 1,
          tint: null,
          on: {
            init(instance) {
              if (!mounted) return;
              reportGeometry(instance);
              scheduleTone();
            },
          },
        });
        const lens = Array.isArray(result) ? result[0] : result;
        lensInstanceRef.current = lens;
        if (!lens) {
          setHeaderPreviewStatus("liquidGL: motor no disponible");
          return;
        }
        // Register the animated mesh as an independent live source.
        const withDynamics = liquidGL as typeof liquidGL & {
          registerDynamic?: (selector: string) => void;
        };
        withDynamics.registerDynamic?.("[data-hero-bg-source] canvas");
        scheduleTone();
        // Fonts might settle after initial capture. Re-capture once, not
        // after each scroll frame, and whenever language/theme changes.
        void document.fonts.ready.then(() => {
          if (mounted) refresh(500);
        });
      })
      .catch(() => {
        if (mounted) setHeaderPreviewStatus("liquidGL: error de inicialización");
      });

    return () => {
      mounted = false;
      themeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("site-lang", onLanguage);
      if (refreshTimer) clearTimeout(refreshTimer);
      if (geometryTimer) clearTimeout(geometryTimer);
      if (toneFrame !== null) cancelAnimationFrame(toneFrame);
      const header = lensRef.current?.closest("header");
      header?.style.removeProperty("--header-logo-foreground");
      header?.style.removeProperty("--header-actions-foreground");
      lensInstanceRef.current?.destroy();
      lensInstanceRef.current = undefined;
    };
  }, []);

  return (
    <div className={`${styles.previewGlassRoot}${active ? "" : ` ${styles.previewGlassInactive}`}`}>
      <div
        id="jpm-preview-header1-lens"
        ref={lensRef}
        className={styles.previewLiquidLens}
        aria-hidden="true"
      />
      <div className={styles.previewNavContent}>{children}</div>
    </div>
  );
}
