"use client";

import { useEffect, useId, useRef } from "react";
import FlowGradientBackground from "./FlowGradientBackground";
import { HERO_MESH } from "../lib/hero-mesh";
import styles from "./venn-flow.module.css";

type Lang = "es" | "en";
type Point = { x: number; y: number };

/** Solo geometría ilustrativa SVG: no son píxeles de layout ni tokens UI. */
const VENN = {
  width: 640,
  height: 530,
  radius: 142,
  circles: {
    design: { x: 240, y: 188 },
    technology: { x: 400, y: 188 },
    usability: { x: 320, y: 315 },
  },
  beam: { length: 132, thickness: 30 },
} as const;

const { design, technology, usability } = VENN.circles;
const r = VENN.radius;
const result: Point = { x: usability.x, y: 252 };

/** Intersecciones exactas de circunferencias con radio idéntico. */
function intersections(a: Point, b: Point, radius: number): [Point, Point] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const offset = Math.sqrt(radius ** 2 - (distance / 2) ** 2);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return [
    { x: mid.x - (dy / distance) * offset, y: mid.y + (dx / distance) * offset },
    { x: mid.x + (dy / distance) * offset, y: mid.y - (dx / distance) * offset },
  ];
}

const upperCrossing = intersections(design, technology, r).sort((a, b) => a.y - b.y)[0];
const rightCrossing = intersections(technology, usability, r).sort((a, b) => b.x - a.x)[0];

function xy(p: Point) {
  return `${p.x} ${p.y}`;
}

/** Un recorrido continuo y sin saltos: círculo Diseño → círculo
 * Tecnología → círculo Usabilidad → intersección triple.
 * Cada arco usa el mismo centro y radio que su círculo visible.
 */
const BEAM_ROUTE = [
  `M ${design.x - r} ${design.y}`,
  `A ${r} ${r} 0 1 0 ${xy(upperCrossing)}`,
  `A ${r} ${r} 0 1 1 ${xy(rightCrossing)}`,
  `A ${r} ${r} 0 0 1 ${usability.x} ${usability.y + r}`,
  `A ${r} ${r} 0 0 1 ${usability.x - r} ${usability.y}`,
  `A ${r} ${r} 0 0 1 ${usability.x} ${usability.y - r}`,
  `L ${xy(result)}`,
].join(" ");

/** Una línea de tiempo normalizada; la duración vive en el design system. */
const TIMELINE = {
  departure: 0.04,
  arrival: 0.72,
  flashEnd: 0.86,
  revealStart: 0.78,
  revealEnd: 0.90,
} as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export default function VennFlow({ lang }: { lang: Lang }) {
  const diagramRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beamRef = useRef<SVGGElement>(null);
  const filledRef = useRef<SVGGElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const pulseRingRef = useRef<SVGCircleElement>(null);
  const resultLabelRef = useRef<SVGTextElement>(null);
  const uid = useId().replace(/:/g, "");
  const maskId = `venn-liquid-mask-${uid}`;
  const beamAlphaId = `venn-beam-alpha-${uid}`;
  const designClipId = `venn-design-clip-${uid}`;
  const techClipId = `venn-technology-clip-${uid}`;
  const staticGradientId = `venn-fallback-mesh-${uid}`;
  const pulseGradientId = `venn-pulse-mesh-${uid}`;
  const glowId = `venn-glow-${uid}`;

  useEffect(() => {
    const root = diagramRef.current;
    const path = pathRef.current;
    const beam = beamRef.current;
    const filled = filledRef.current;
    const pulse = pulseRef.current;
    const ring = pulseRingRef.current;
    const resultText = resultLabelRef.current;
    if (!root || !path || !beam || !filled || !pulse || !ring || !resultText) return;

    const prefersLessMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cycleValue = getComputedStyle(root).getPropertyValue("--motion-diagram-cycle").trim();
    const parsedCycle = Number.parseFloat(cycleValue);
    const duration = (Number.isFinite(parsedCycle) && parsedCycle > 0 ? parsedCycle : 9) *
      (cycleValue.endsWith("ms") ? 1 : 1000);
    const length = path.getTotalLength();
    let frame = 0;
    let active = false;
    let startedAt = 0;
    let completed = false;

    const staticState = () => {
      beam.setAttribute("opacity", "0");
      filled.setAttribute("opacity", "1");
      pulse.setAttribute("opacity", "0");
      ring.setAttribute("opacity", "0");
      resultText.setAttribute("opacity", "1");
    };

    const render = (timestamp: number) => {
      if (!active || prefersLessMotion.matches) return;
      if (!startedAt) startedAt = timestamp;
      const phase = Math.min(1, (timestamp - startedAt) / duration);

      // La partícula larga lleva el líquido del shader, no un stroke estático.
      const progress = smooth(TIMELINE.departure, TIMELINE.arrival, phase);
      const position = path.getPointAtLength(progress * length);
      const ahead = path.getPointAtLength(Math.min(length, progress * length + 1));
      const behind = path.getPointAtLength(Math.max(0, progress * length - 1));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
      const appearing = smooth(TIMELINE.departure / 2, TIMELINE.departure + 0.025, phase);
      const disappearing = 1 - smooth(TIMELINE.arrival - 0.01, TIMELINE.arrival + 0.035, phase);

      beam.setAttribute("transform", `translate(${position.x} ${position.y}) rotate(${angle})`);
      beam.setAttribute("opacity", String(appearing * disappearing));

      // Primero destella la zona de convergencia. Después el mismo
      // lienzo WebGL queda visible dentro de la intersección exacta.
      const flash = Math.sin(Math.PI * clamp((phase - TIMELINE.arrival) / (TIMELINE.flashEnd - TIMELINE.arrival)));
      pulse.setAttribute("opacity", String(Math.max(0, flash) * 0.9));
      pulse.setAttribute("r", String(r * (0.26 + 0.49 * smooth(TIMELINE.arrival, TIMELINE.flashEnd, phase))));
      ring.setAttribute("opacity", String(Math.max(0, flash) * 0.85));
      ring.setAttribute("r", String(r * (0.1 + 0.64 * smooth(TIMELINE.arrival, TIMELINE.flashEnd, phase))));

      const fillAmount = smooth(TIMELINE.revealStart, TIMELINE.revealEnd, phase);
      filled.setAttribute("opacity", String(fillAmount));
      resultText.setAttribute("opacity", String(fillAmount));
      // El recorrido concluye una sola vez: permanece el mismo mesh
      // animado dentro de la intersección, sin reinicios de loader.
      if (phase < 1) {
        frame = window.requestAnimationFrame(render);
      } else {
        completed = true;
        staticState();
      }
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const setVisibility = (visible: boolean) => {
      active = visible;
      stop();
      if (prefersLessMotion.matches || completed) {
        staticState();
        return;
      }
      if (active) {
        startedAt = 0;
        frame = window.requestAnimationFrame(render);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => setVisibility(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(root);
    const onMotionChange = () => setVisibility(active);
    prefersLessMotion.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      prefersLessMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div ref={diagramRef} className={styles.root}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VENN.width} ${VENN.height}`}
        role="img"
        aria-label={
          lang === "es"
            ? "Tres círculos de Venn: Diseño, Tecnología y Usabilidad. Una partícula de líquido del hero recorre los tres y converge en su intersección, donde destella y llena el resultado."
            : "Three Venn circles: Design, Technology and Usability. A liquid particle travels the three circles and fills their shared intersection after a flash."
        }
      >
        <defs>
          <path ref={pathRef} d={BEAM_ROUTE} id={`venn-route-${uid}`} />
          <clipPath id={designClipId}>
            <circle cx={design.x} cy={design.y} r={r} />
          </clipPath>
          <clipPath id={techClipId}>
            <circle cx={technology.x} cy={technology.y} r={r} />
          </clipPath>
          <linearGradient id={beamAlphaId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="25%" stopColor="white" stopOpacity=".34" />
            <stop offset="57%" stopColor="white" stopOpacity=".91" />
            <stop offset="85%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={staticGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stopColor={HERO_MESH.blue} />
            <stop offset=".36" stopColor={HERO_MESH.cyan} />
            <stop offset=".6" stopColor={HERO_MESH.ice} />
            <stop offset=".83" stopColor={HERO_MESH.orange} />
            <stop offset="1" stopColor={HERO_MESH.blue} />
          </linearGradient>
          <radialGradient id={pulseGradientId}>
            <stop stopColor={HERO_MESH.ice} stopOpacity="1" />
            <stop offset=".35" stopColor={HERO_MESH.cyan} stopOpacity=".7" />
            <stop offset=".7" stopColor={HERO_MESH.blue} stopOpacity=".25" />
            <stop offset="1" stopColor={HERO_MESH.blue} stopOpacity="0" />
          </radialGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={VENN.beam.thickness / 5} result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width={VENN.width} height={VENN.height}>
            <g ref={beamRef} opacity="0">
              <rect
                x={-VENN.beam.length / 2}
                y={-VENN.beam.thickness / 2}
                width={VENN.beam.length}
                height={VENN.beam.thickness}
                rx={VENN.beam.thickness / 2}
                fill={`url(#${beamAlphaId})`}
              />
            </g>
            <g ref={filledRef} opacity="0">
              <g clipPath={`url(#${designClipId})`}>
                <g clipPath={`url(#${techClipId})`}>
                  <circle cx={usability.x} cy={usability.y} r={r} fill="white" />
                </g>
              </g>
            </g>
          </mask>
        </defs>

        <circle className={styles.circle} cx={design.x} cy={design.y} r={r} />
        <circle className={styles.circle} cx={technology.x} cy={technology.y} r={r} />
        <circle className={styles.circle} cx={usability.x} cy={usability.y} r={r} />

        {/* Una sola textura WebGL, exactamente el shader animado del hero,
            aparece mediante la máscara en la partícula y en el resultado. */}
        <g mask={`url(#${maskId})`} filter={`url(#${glowId})`} aria-hidden="true">
          <rect width={VENN.width} height={VENN.height} fill={`url(#${staticGradientId})`} />
          <foreignObject x="0" y="0" width={VENN.width} height={VENN.height}>
            <div className={styles.shaderHost}>
              <FlowGradientBackground
                colors={[
                  HERO_MESH.background,
                  HERO_MESH.blue,
                  HERO_MESH.cyan,
                  HERO_MESH.orange,
                  HERO_MESH.ice,
                ]}
                className={styles.shaderCanvas}
              />
            </div>
          </foreignObject>
        </g>

        <circle
          ref={pulseRef}
          cx={result.x}
          cy={result.y}
          r={r / 4}
          opacity="0"
          fill={`url(#${pulseGradientId})`}
          pointerEvents="none"
        />
        <circle
          ref={pulseRingRef}
          cx={result.x}
          cy={result.y}
          r={r / 10}
          opacity="0"
          fill="none"
          stroke={HERO_MESH.cyan}
          className={styles.pulseRing}
          pointerEvents="none"
        />

        <text className={styles.circleLabel} x={design.x - r * .42} y={design.y} textAnchor="middle">
          {lang === "es" ? "Diseño" : "Design"}
        </text>
        <text className={styles.circleLabel} x={technology.x + r * .42} y={technology.y} textAnchor="middle">
          {lang === "es" ? "Tecnología" : "Technology"}
        </text>
        <text className={styles.circleLabel} x={usability.x} y={usability.y + r * .55} textAnchor="middle">
          {lang === "es" ? "Usabilidad" : "Usability"}
        </text>
        <text ref={resultLabelRef} className={styles.resultLabel} x={result.x} y={result.y} textAnchor="middle" opacity="0">
          {lang === "es" ? "Resultado" : "Outcome"}
        </text>
      </svg>
    </div>
  );
}
