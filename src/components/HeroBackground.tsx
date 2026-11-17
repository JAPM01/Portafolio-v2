"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import styles from "./hero.module.css";
import { BRAND_PALETTE } from "../lib/brand-palette";

// Fondo del hero: Flow Gradient (Made for Award, MIT, sin dependencias).
// Reemplaza el runtime de aidesigner.ai (de pago, mostraba "made with ai
// designer"). Colores de Jafet en el orden del componente:
// [fondo, deep, body, hot, accent].
// Paleta exclusiva Sentos: azul principal, azul medio luminoso,
// naranja de acento y neutros. Valores centralizados en brand-palette.ts.
// El efecto y la interactividad no cambian, solo los colores.
export default function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <FlowGradientBackground
        colors={[
          BRAND_PALETTE.gray[0],
          BRAND_PALETTE.blue[0],
          BRAND_PALETTE.blue[3],
          BRAND_PALETTE.orange[0],
          BRAND_PALETTE.blue[6],
        ]}
        className={styles.flowCanvas}
      />
    </div>
  );
}
