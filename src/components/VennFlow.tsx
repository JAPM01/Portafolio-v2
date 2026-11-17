"use client";

import { useEffect, useId, useRef } from "react";
import { HERO_MESH } from "../lib/hero-mesh";
import styles from "./venn-flow.module.css";

type Lang = "es" | "en";

/** Geometría única para círculos, intersección, recorrido y etiquetas.
 *  El trazado SVG se deriva de estos radios y centros, no de curvas
 *  independientes que podrían separarse visualmente del diagrama.
 */
const GEOMETRY = {
  width: 640,
  height: 472,
  radius: 140,
  leftX: 225,
  rightX: 415,
  axisY: 200,
  resultY: 405,
} as const;

const sharedX = (GEOMETRY.leftX + GEOMETRY.rightX) / 2;
const crossingOffset = Math.sqrt(
  GEOMETRY.radius ** 2 - (sharedX - GEOMETRY.leftX) ** 2
);
const topCrossing = GEOMETRY.axisY - crossingOffset;
const lowerCrossing = GEOMETRY.axisY + crossingOffset;
const r = GEOMETRY.radius;
const y = GEOMETRY.axisY;

/** Diseño (arco superior izq.) → Tecnología (arcos superior e inferior
 *  derechos) → zona compartida. Cada arco pertenece exactamente a
 *  uno de los dos círculos del Venn.
 */
const toConvergence = [
  `M ${GEOMETRY.leftX - r} ${y}`,
  `A ${r} ${r} 0 0 1 ${sharedX} ${topCrossing}`,
  `A ${r} ${r} 0 0 1 ${GEOMETRY.rightX + r} ${y}`,
  `A ${r} ${r} 0 0 1 ${sharedX} ${lowerCrossing}`,
  `C ${sharedX - r * 0.12} ${lowerCrossing - r * 0.18}, ${sharedX - r * 0.08} ${y + r * 0.12}, ${sharedX} ${y}`,
].join(" ");

const toOutcome = [
  `M ${sharedX} ${y}`,
  `C ${sharedX + r * 0.06} ${y + r * 0.44}, ${sharedX - r * 0.04} ${GEOMETRY.resultY - r * 0.37}, ${sharedX} ${GEOMETRY.resultY}`,
].join(" ");

export default function VennFlow({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const gradientId = `venn-mesh-${uid}`;
  const lensId = `venn-lens-${uid}`;
  const clipId = `venn-clip-${uid}`;
  const burstId = `venn-burst-${uid}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!("IntersectionObserver" in window)) {
      root.dataset.flowVisible = "true";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        root.dataset.flowVisible = String(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const renderCurrent = (path: string, phase: "approach" | "outcome") => (
    <g className={phase === "approach" ? styles.approach : styles.outcome} aria-hidden="true">
      <path
        className={`${styles.current} ${styles.aura}`}
        d={path}
        pathLength={1000}
        stroke={`url(#${gradientId})`}
      />
      <path
        className={`${styles.current} ${styles.body}`}
        d={path}
        pathLength={1000}
        stroke={`url(#${gradientId})`}
      />
      <path
        className={`${styles.current} ${styles.core}`}
        d={path}
        pathLength={1000}
        stroke={`url(#${gradientId})`}
      />
    </g>
  );

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-flow-visible="false"
      style={{
        "--mesh-cyan": HERO_MESH.cyan,
        "--mesh-ice": HERO_MESH.ice,
      } as React.CSSProperties}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${GEOMETRY.width} ${GEOMETRY.height}`}
        role="img"
        aria-label={
          lang === "es"
            ? "Diseño y Tecnología se intersectan. Una corriente luminosa recorre ambos círculos, converge y culmina con un pulso en Resultados."
            : "Design and Technology overlap. A luminous current travels both circles, converges and ends with a pulse at Outcomes."
        }
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={GEOMETRY.leftX - r}
            y1={topCrossing}
            x2={GEOMETRY.rightX + r}
            y2={GEOMETRY.resultY}
          >
            <stop offset="0%" stopColor={HERO_MESH.blue} />
            <stop offset="22%" stopColor={HERO_MESH.cyan} />
            <stop offset="34%" stopColor={HERO_MESH.ice} />
            <stop offset="52%" stopColor={HERO_MESH.blue} />
            <stop offset="69%" stopColor={HERO_MESH.cyan} />
            <stop offset="82%" stopColor={HERO_MESH.orange} />
            <stop offset="100%" stopColor={HERO_MESH.ice} />
          </linearGradient>
          <radialGradient id={lensId} gradientUnits="userSpaceOnUse" cx={sharedX} cy={y} r={r}>
            <stop offset="0%" stopColor={HERO_MESH.cyan} stopOpacity=".2" />
            <stop offset="68%" stopColor={HERO_MESH.blue} stopOpacity=".055" />
            <stop offset="100%" stopColor={HERO_MESH.blue} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={burstId}>
            <stop offset="0%" stopColor={HERO_MESH.ice} stopOpacity="1" />
            <stop offset="25%" stopColor={HERO_MESH.cyan} stopOpacity=".72" />
            <stop offset="67%" stopColor={HERO_MESH.blue} stopOpacity=".22" />
            <stop offset="100%" stopColor={HERO_MESH.blue} stopOpacity="0" />
          </radialGradient>
          <clipPath id={clipId}>
            <circle cx={GEOMETRY.leftX} cy={y} r={r} />
          </clipPath>
        </defs>

        <circle className={styles.ring} cx={GEOMETRY.leftX} cy={y} r={r} />
        <circle className={styles.ring} cx={GEOMETRY.rightX} cy={y} r={r} />
        <circle
          className={styles.lens}
          cx={GEOMETRY.rightX}
          cy={y}
          r={r}
          clipPath={`url(#${clipId})`}
          fill={`url(#${lensId})`}
        />
        <path className={styles.guide} d={toOutcome} />
        <circle className={styles.centerPoint} cx={sharedX} cy={y} r={r / 38} />

        {renderCurrent(toConvergence, "approach")}
        <circle
          className={styles.convergencePulse}
          cx={sharedX}
          cy={y}
          r={r / 3}
          fill={`url(#${burstId})`}
          aria-hidden="true"
        />
        {renderCurrent(toOutcome, "outcome")}
        <circle
          className={styles.resultBloom}
          cx={sharedX}
          cy={GEOMETRY.resultY}
          r={r / 2.6}
          fill={`url(#${burstId})`}
          aria-hidden="true"
        />
        <circle
          className={styles.resultRing}
          cx={sharedX}
          cy={GEOMETRY.resultY}
          r={r / 10}
          aria-hidden="true"
        />
        <circle
          className={styles.resultPoint}
          cx={sharedX}
          cy={GEOMETRY.resultY}
          r={r / 35}
          aria-hidden="true"
        />

        <text className={styles.label} x={GEOMETRY.leftX - r / 3} y={y} textAnchor="middle">
          {lang === "es" ? "Diseño" : "Design"}
        </text>
        <text className={styles.label} x={GEOMETRY.rightX + r / 3} y={y} textAnchor="middle">
          {lang === "es" ? "Tecnología" : "Technology"}
        </text>
        <text className={styles.outcomeLabel} x={sharedX} y={GEOMETRY.height - r / 7} textAnchor="middle">
          {lang === "es" ? "Resultados" : "Outcomes"}
        </text>
      </svg>
    </div>
  );
}
