"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { setHeaderPreviewStatus } from "../lib/header-preview";
import styles from "./site-nav.module.css";

/** Preview 1: original NaughtyDuk liquidGL 3.0 WebGPU/WebGL.
 * The lens is only the backdrop; navigation remains actual interactive DOM.
 * The package hides its target element and draws a separate GPU layer.
 */
export default function HeaderLiquidGL({ children, snapshotSelector }: { children: ReactNode; snapshotSelector: string }) {
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
          snapshot: snapshotSelector,
          engine: "auto",
          resolution: window.innerWidth < 768 ? 1.0 : 1.15,
          zIndex: 9998,
          content: false,
          refraction: 0.032,
          aberration: 0.065,
          bevelDepth: 0.085,
          bevelWidth: 0.13,
          frost: 0.15,
          shadow: false,
          specular: true,
          reveal: "none",
          draggable: false,
          tilt: false,
          interaction: "fluid",
          interactionStrength: 0.48,
          interactionRadius: 0.34,
          interactionViscosity: 0.78,
          tint: null,
          on: {
            init() {
              if (active) setHeaderPreviewStatus("liquidGL: inicializado (motor auto)");
            },
          },
        });
        lens = Array.isArray(result) ? result[0] : result;
        if (snapshotSelector === "#main") {
          try {
            // Register the moving hero shader once, while the snapshot root
            // remains stable throughout scrolling.
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
  }, [snapshotSelector]);

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
