"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import styles from "./hero.module.css";

// Fondo del hero: Flow Gradient (Made for Award, MIT, sin dependencias).
// Reemplaza el runtime de aidesigner.ai (de pago, mostraba "made with ai
// designer"). Colores de Jafet en el orden del componente:
// [fondo, deep, body, hot, accent].
// Paleta NUEVA (Jafet 16 Nov 2026 19:05 CST): la de Sentos (Behance) —
// azul rey #000AFF dominante, ondas cian #6FD3FF, acento naranja
// #FF9636, fondo casi negro #030403 y brillo casi blanco #E8F7FF.
// El efecto y la interactividad no cambian, solo los colores.
export default function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <FlowGradientBackground
        colors={["#030403", "#000AFF", "#6FD3FF", "#FF9636", "#E8F7FF"]}
        className={styles.flowCanvas}
      />
    </div>
  );
}
