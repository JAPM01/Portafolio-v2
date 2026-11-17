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
export default function HeaderLiquidGL({ children }: { children: ReactNode }) {
  const lensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let lens: { destroy(): void } | undefined;

    setHeaderPreviewStatus("Iniciando WebGPU/WebGL");

    import("liquid-gl")
      .then(({ default: liquidGL }) => {
        if (!active || !lensRef.current) return;

        const result = liquidGL({
          target: "#jpm-preview-header1-lens",
          snapshot: "body",
          // Mobile Chromium: prefer the stable WebGL2 shader backend.
          // This avoids WebGPU-specific capture/edge artifacts on Android.
          engine: window.innerWidth < 768 ? "webgl2" : "auto",
          resolution: window.innerWidth < 768 ? 1.25 : 1.6,
          zIndex: 9998,
          content: false,
          refraction: 0.006,
          aberration: 0,
          bevelDepth: 0.006,
          bevelWidth: 0.055,
          frost: 0,
          shadow: false,
          specular: true,
          reveal: "none",
          draggable: false,
          tilt: false,
          interaction: "fluid",
          interactionStrength: 0.44,
          interactionRadius: 0.35,
          interactionViscosity: 0.65,
          magnify: 1,
          tint: null,
          on: {
            init() {
              if (active) setHeaderPreviewStatus("liquidGL: lente lista · " + (window.innerWidth < 768 ? "WebGL2" : "automático"));
            },
          },
        });
        lens = Array.isArray(result) ? result[0] : result;
        {
          try {
            // Register the moving hero shader once. The body snapshot
            // stays stable and the navbar is explicitly ignored by rasterization.
            const withDynamics = liquidGL as typeof liquidGL & { registerDynamic?: (selector: string) => void };
            withDynamics.registerDynamic?.("[data-hero-bg-source] canvas");
          } catch {
            // Static capture remains valid if dynamic registration fails.
          }
        }
        if (!lens) setHeaderPreviewStatus("liquidGL: sin motor disponible");
      })
      .catch(() => {
        if (active) setHeaderPreviewStatus("liquidGL: error de inicialización");
      });

    return () => {
      active = false;
      lens?.destroy();
    };
  }, []);

  return (
    <div className={styles.previewGlassRoot}>
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
