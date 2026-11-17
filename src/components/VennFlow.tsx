"use client";

import { useEffect, useId, useRef } from "react";
import { HERO_MESH } from "../lib/hero-mesh";
import styles from "./venn-flow.module.css";

type Lang = "es" | "en";

/**
 * Un solo recorrido: contorno de Diseño → intersección →
 * contorno de Tecnología → intersección → Resultados.
 *
 * La corriente usa SVG (tres capas de trazo con el gradiente del shader
 * del hero) y una única línea de tiempo CSS, sin WebGL extra.
 * Se pausa fuera de pantalla y respeta prefers-reduced-motion.
 */
const ROUTE =
  "M 210 69 A 136 136 0 1 0 210 341 " +
  "C 261 339 290 294 290 205 " +
  "C 290 121 328 72 370 69 " +
  "A 136 136 0 1 1 370 341 " +
  "C 321 340 290 293 290 205 " +
  "L 290 396";

export default function VennFlow({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const unique = useId().replace(/:/g, "");
  const fluidId = `venn-fluid-${unique}`;
  const auraId = `venn-aura-${unique}`;
  const bloomId = `venn-bloom-${unique}`;
  const ambientId = `venn-ambient-${unique}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!("IntersectionObserver" in window)) {
      root.dataset.flowActive = "true";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        root.dataset.flowActive = entry.isIntersecting ? "true" : "false";
      },
      { threshold: 0.16 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.root} ref={rootRef} data-flow-active="false">
      <svg
        className={styles.svg}
        viewBox="0 0 580 465"
        role="img"
        aria-label={
          lang === "es"
            ? "Diagrama de Venn. Una corriente recorre Diseño, entra en Tecnología, vuelve a la intersección y finaliza con un pulso en Resultados."
            : "Venn diagram. A current moves from Design to Technology, returns to the intersection and finishes with a pulse at Outcomes."
        }
      >
        <defs>
          <linearGradient id={fluidId} x1="70" y1="65" x2="510" y2="410" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={HERO_MESH.blue} />
            <stop offset="22%" stopColor={HERO_MESH.cyan} />
            <stop offset="36%" stopColor={HERO_MESH.ice} />
            <stop offset="53%" stopColor={HERO_MESH.blue} />
            <stop offset="68%" stopColor={HERO_MESH.cyan} />
            <stop offset="83%" stopColor={HERO_MESH.orange} />
            <stop offset="100%" stopColor={HERO_MESH.ice} />
          </linearGradient>
          <radialGradient id={ambientId}>
            <stop offset="0%" stopColor={HERO_MESH.blue} stopOpacity=".15" />
            <stop offset="55%" stopColor={HERO_MESH.cyan} stopOpacity=".045" />
            <stop offset="100%" stopColor={HERO_MESH.cyan} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={bloomId}>
            <stop offset="0%" stopColor={HERO_MESH.ice} stopOpacity=".92" />
            <stop offset="22%" stopColor={HERO_MESH.cyan} stopOpacity=".68" />
            <stop offset="55%" stopColor={HERO_MESH.blue} stopOpacity=".24" />
            <stop offset="100%" stopColor={HERO_MESH.blue} stopOpacity="0" />
          </radialGradient>
          <filter id={auraId} x="-25%" y="-35%" width="150%" height="170%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Estructura editorial: un Venn, no una red de nodos. */}
        <ellipse cx="290" cy="205" rx="218" ry="180" fill={`url(#${ambientId})`} />
        <circle className={styles.baseCircle} cx="210" cy="205" r="136" />
        <circle className={styles.baseCircle} cx="370" cy="205" r="136" />
        <path className={styles.resultGuide} d="M 290 205 L 290 396" />
        <circle className={styles.intersectionOutline} cx="290" cy="205" r="31" />
        <circle className={styles.intersectionCore} cx="290" cy="205" r="4" />

        <g aria-hidden="true">
          <path className={`${styles.flowLayer} ${styles.flowAura}`} d={ROUTE} pathLength={1000} stroke={`url(#${fluidId})`} filter={`url(#${auraId})`} />
          <path className={`${styles.flowLayer} ${styles.flowBody}`} d={ROUTE} pathLength={1000} stroke={`url(#${fluidId})`} />
          <path className={`${styles.flowLayer} ${styles.flowCore}`} d={ROUTE} pathLength={1000} stroke={`url(#${fluidId})`} />
          <circle className={styles.intersectionResponse} cx="290" cy="205" r="24" fill={`url(#${bloomId})`} />
          <circle className={styles.impactBloom} cx="290" cy="396" r="39" fill={`url(#${bloomId})`} />
          <circle className={styles.impactRing} cx="290" cy="396" r="15" />
          <circle className={styles.impactPoint} cx="290" cy="396" r="3.5" />
        </g>

        <text className={styles.diagramLabel} x="170" y="204" textAnchor="middle">
          {lang === "es" ? "DISEÑO" : "DESIGN"}
        </text>
        <text className={styles.diagramLabel} x="409" y="204" textAnchor="middle">
          {lang === "es" ? "TECNOLOGÍA" : "TECHNOLOGY"}
        </text>
        <text className={styles.resultLabel} x="290" y="448" textAnchor="middle">
          {lang === "es" ? "RESULTADOS" : "OUTCOMES"}
        </text>
      </svg>
    </div>
  );
}
