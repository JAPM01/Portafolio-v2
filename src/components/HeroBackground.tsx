"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import styles from "./hero.module.css";

// FlowGradientBackground resuelve la paleta directamente desde CSS.
export default function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <FlowGradientBackground follow={0.08} className={styles.flowCanvas} />
    </div>
  );
}
