"use client";

import type { ReactNode } from "react";
import { LiquidGlassInteractive } from "simple-liquid-glass/interactive";
import { setHeaderPreviewStatus } from "../lib/header-preview";
import styles from "./site-nav.module.css";

/** Preview 2: Simple Liquid Glass. An explicit sibling backdrop is crucial:
 * without it, Android silently falls back to frosted CSS.
 */
export default function HeaderSimpleGlass({
  children,
  backdropSelector,
}: {
  children: ReactNode;
  backdropSelector: string;
}) {
  return (
    <div className={styles.previewGlassRoot}>
    <LiquidGlassInteractive
      className={styles.previewSimpleGlass}
      style={{ width: "100%", height: "100%" }}
      backdropSelector={backdropSelector}
      renderer="webgl"
      refraction="lens"
      lensProfile="player"
      lensOptions={{
        strength: 0.14,
        depth: 0.18,
        curvature: 0.38,
        bend: 0.23,
        bendWidth: 0.12,
        sheen: 0.65,
        specular: 0.75,
        brightness: 0,
      }}
      radius={999}
      quality="high"
      blur={0}
      frost={0}
      saturation={135}
      dispersion={20}
      aberrationIntensity={0.18}
      material="clear"
      glassColor="rgba(206,206,206,0.025)"
      liquidTrigger="always"
      maxShift={2}
      clickRipple="ripple"
      rippleIntensity={0.4}
      elasticity={0.075}
      damping={0.78}
      stiffness={0.18}
      onDiagnosticsChange={({ strategy, reason }) => {
        setHeaderPreviewStatus(`Simple Glass: ${strategy} · ${reason}`);
      }}
    >
      {children}
    </LiquidGlassInteractive>
    </div>
  );
}
