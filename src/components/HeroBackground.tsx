"use client";

import FlowGradientBackground from "./FlowGradientBackground";
import styles from "./hero.module.css";

// FlowGradientBackground resuelve la paleta directamente desde CSS.
// follow/zoom/center son opcionales: por defecto el Hero reacciona
// al mouse con el encuadre original; el Venn los sobrescribe
// (follow 0 = estático, zoom bajo y centro desplazado).
export default function HeroBackground({
  follow = 0.08,
  zoom = 1,
  center = [0.5, 0.5],
  referenceSpace = "canvas",
}: {
  follow?: number;
  zoom?: number;
  center?: [number, number];
  referenceSpace?: "canvas" | "viewport";
} = {}) {
  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">
      <FlowGradientBackground follow={follow} zoom={zoom} center={center} referenceSpace={referenceSpace} className={styles.flowCanvas} />
    </div>
  );
}
