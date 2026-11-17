"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import styles from "./hero.module.css";

// Fondo del hero: Flow Gradient (Made for Award, MIT, sin dependencias).
// Reemplaza el runtime de aidesigner.ai (de pago, mostraba "made with ai
// designer"). Colores de Jafet en el orden del componente:
// [fondo, deep, body, hot, accent].
// Paleta Sentos ÚNICA (Jafet 16 Nov 2026 23:25 CST): fondo casi negro
// #030403, azul rey #000AFF, ondas CIAN #6FD3FF, acento naranja #FF9636
// y brillo casi blanco #E8F7FF. NO usar los tonos derivados de
// brand-palette.ts: el azul claro #878AF8 no es el cian y cambia el mesh.
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
