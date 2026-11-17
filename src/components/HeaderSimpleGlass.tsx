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
    <LiquidGlassInteractive
      className={styles.previewSimpleGlass}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      backdropSelector={backdropSelector}
      renderer="webgl"
      refraction="lens"
      lensProfile="loupe"
      lensOptions={{
        strength: 0.2,
        depth: 0.3,
        curvature: 0.6,
        bend: 0.65,
        bendWidth: 0.28,
        sheen: 1.4,
        specular: 1.5,
        brightness: 0,
      }}
      radius={999}
      quality="high"
      blur={0}
      frost={0}
      saturation={135}
      dispersion={62}
      aberrationIntensity={0.82}
      material="clear"
      glassColor="rgba(206,206,206,0.04)"
      liquidTrigger="always"
      followPointer
      clickRipple="ripple"
      rippleIntensity={1.2}
      elasticity={0.19}
      damping={0.78}
      stiffness={0.18}
      onDiagnosticsChange={({ strategy, reason }) => {
        setHeaderPreviewStatus(`Simple Glass: ${strategy} · ${reason}`);
      }}
    >
      {children}
    </LiquidGlassInteractive>
  );
}
