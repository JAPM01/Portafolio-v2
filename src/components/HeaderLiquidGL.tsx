"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { setHeaderPreviewStatus } from "../lib/header-preview";
import styles from "./site-nav.module.css";

/** liquidGL v3.0: official menu-bar bevel geometry with neutral RGB
 * sampling. Using aberration=0 during Android validation disables per-channel
 * offset samples while preserving true refraction, specular and fluid touch.
 * Keep one instance with the upstream-recommended body snapshot across page scroll.
 */
export default function HeaderLiquidGL({ children, active }: { children: ReactNode; active: boolean }) {
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    let lens: { destroy(): void; renderer?: { captureSnapshot(): Promise<boolean> } } | undefined;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let lastRefresh = 0;
    const refresh = (delay: number) => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (!mounted || !lens?.renderer || Date.now() - lastRefresh < 1000) return;
        lastRefresh = Date.now();
        void lens.renderer.captureSnapshot();
      }, delay);
    };
    const onScrollEnd = () => refresh(330);
    const onLanguageChange = () => refresh(250);
    const themeObserver = new MutationObserver(() => refresh(450));
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "lang"],
    });
    window.addEventListener("scroll", onScrollEnd, { passive: true });
    window.addEventListener("site-lang", onLanguageChange);

    setHeaderPreviewStatus("Inicializando refracción");

    import("liquid-gl")
      .then(({ default: liquidGL }) => {
        if (!mounted || !lensRef.current) return;

        const result = liquidGL({
          target: "#jpm-preview-header1-lens",
          snapshot: "body",
          // Mobile Chromium: prefer the stable WebGL2 shader backend.
          // This avoids WebGPU-specific capture/edge artifacts on Android.
          engine: window.innerWidth < 768 ? "webgl2" : "auto",
          resolution: window.innerWidth < 768 ? 1.25 : 1.6,
          // Anchor .header has z-index 9999. This yields GPU canvas z=1
          // inside the header, below the real navigation at z=3.
          zIndex: 10001,
          content: false,
          // Shader patched to use lens-pixel units (not page-height UV).
          refraction: 0.026,
          aberration: 0,
          bevelDepth: 0.018,
          bevelWidth: 0.071,
          frost: 0,
          shadow: false,
          // Prevent a second bright white highlight on light surfaces.
          specular: false,
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
              // Report the actual renderer, not merely the requested engine.
              const backend = (instance as {
                renderer?: {
                  backend?: { constructor?: { name?: string }; maxTextureSize?: number };
                  scaleFactor?: number;
                };
              }).renderer;
              const engine = backend?.backend?.constructor?.name || "motor no identificado";
              const scale = backend?.scaleFactor;
              setHeaderPreviewStatus(
                "liquidGL: " + engine +
                (typeof scale === "number" ? " · captura " + scale.toFixed(2) + "x" : "")
              );
            },
          },
        });
        lens = Array.isArray(result) ? result[0] : result;
        // Layout fonts and dynamic hero content may settle after the first
        // full-document capture. Refresh once without remounting the lens.
        refresh(700);
        {
          try {
            // Live hero canvas is registered. The header itself is excluded
            // from the rasterizer and the GL canvas stays mounted on scroll.
            const withDynamics = liquidGL as typeof liquidGL & { registerDynamic?: (selector: string) => void };
            withDynamics.registerDynamic?.("[data-hero-bg-source] canvas");
          } catch {
            // Static capture remains valid if dynamic registration fails.
          }
        }
        if (!lens) setHeaderPreviewStatus("liquidGL: sin motor disponible");
      })
      .catch(() => {
        if (mounted) setHeaderPreviewStatus("liquidGL: error de inicialización");
      });

    return () => {
      mounted = false;
      themeObserver.disconnect();
      window.removeEventListener("scroll", onScrollEnd);
      window.removeEventListener("site-lang", onLanguageChange);
      if (refreshTimer) clearTimeout(refreshTimer);
      lens?.destroy();
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
