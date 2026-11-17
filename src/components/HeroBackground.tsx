"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import { HERO_MESH } from "../lib/hero-mesh";
import styles from "./hero.module.css";

// El fondo WebGL y el diagrama Venn comparten exactamente los mismos
// cinco tonos. El orden de FlowGradientBackground es:
// [background, deep, body, hot, accent].
export default function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <FlowGradientBackground
        colors={[
          HERO_MESH.background,
          HERO_MESH.blue,
          HERO_MESH.cyan,
          HERO_MESH.orange,
          HERO_MESH.ice,
        ]}
        follow={0.08}
        className={styles.flowCanvas}
      />
    </div>
  );
}
