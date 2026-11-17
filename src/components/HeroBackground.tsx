"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import styles from "./hero.module.css";

// Fondo del hero: Flow Gradient (Made for Award, MIT, sin dependencias).
// Reemplaza el runtime de aidesigner.ai (de pago, mostraba "made with ai
// designer"). Colores de Jafet en el orden del componente:
// [fondo, deep, body, hot, accent]. El body es azul (no negro) para
// que el mesh no quede tan oscuro: el negro solo queda de fondo y en
// los pliegues.
export default function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <FlowGradientBackground
        colors={["#000000", "#1100ff", "#1100ff", "#fe0149", "#00d0f0"]}
        className={styles.flowCanvas}
      />
    </div>
  );
}
