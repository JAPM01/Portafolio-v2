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
          resolution: window.innerWidth < 768 ? 0.8 : 1.15,
          zIndex: 9998,
          content: false,
          refraction: 0.058,
          aberration: 0.56,
          bevelDepth: 0.17,
          bevelWidth: 0.24,
          frost: 0.65,
          shadow: false,
          specular: true,
          reveal: "none",
          draggable: false,
          tilt: false,
          interaction: "fluid",
          interactionStrength: 0.8,
          interactionRadius: 0.42,
          interactionViscosity: 0.72,
          tint: null,
          on: {
            init() {
              if (active) setHeaderPreviewStatus("liquidGL: inicializado (motor auto)");
            },
          },
        });
        lens = Array.isArray(result) ? result[0] : result;
        if (snapshotSelector === "[data-hero-bg-source] canvas") {
          try {
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
