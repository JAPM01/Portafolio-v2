"use client";

import { useEffect, useId, useRef } from "react";
import { HERO_MESH } from "../lib/hero-mesh";
import styles from "./venn-flow.module.css";

type Lang = "es" | "en";

/** Geometría en coordenadas SVG, independiente del layout CSS. */
const G = {
  width: 640,
  height: 530,
  radius: 142,
  design: { x: 240, y: 188 },
  technology: { x: 400, y: 188 },
  usability: { x: 320, y: 315 },
  convergence: { x: 320, y: 252 },
} as const;

const CENTERS = [G.design, G.technology, G.usability] as const;

/** Color con el que prende cada círculo: el mismo de su palabra
    en el manifiesto — diseño naranja, tecnología azul, usabilidad cian. */
const LIT_COLORS = [HERO_MESH.orange, HERO_MESH.blue, HERO_MESH.cyan] as const;

/**
 * Ventanas de la animación, en fracción del ciclo (8 s):
 * cada círculo se enciende con su color y se apaga, uno por uno;
 * luego el centro hace el pulse que avisa que el recorrido terminó
 * y la intersección se rellena del líquido del mesh.
 * Los círculos NUNCA se rellenan: solo su contorno prende.
 */
const P = {
  on: [
    [0.02, 0.07, 0.17, 0.23],
    [0.21, 0.26, 0.36, 0.42],
    [0.40, 0.45, 0.55, 0.61],
  ],
  pulse: [0.63, 0.78],
  fillIn: [0.78, 0.90],
} as const;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
function smooth(a: number, b: number, t: number) {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}

function durationMs(el: HTMLElement) {
  const value = getComputedStyle(el).getPropertyValue("--motion-diagram-cycle").trim();
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration) || duration <= 0) return 8000;
  return value.endsWith("ms") ? duration : duration * 1000;
}

export default function VennFlow({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const litRefs = useRef<(SVGCircleElement | null)[]>([]);
  const flashRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const fillRef = useRef<SVGCircleElement>(null);

  const id = useId().replace(/:/g, "");
  const fillId = `venn-fill-${id}`;
  const flashId = `venn-flash-${id}`;
  const glowId = `venn-glow-${id}`;
  const clipD = `venn-d-${id}`;
  const clipT = `venn-t-${id}`;
  const clipU = `venn-u-${id}`;

  useEffect(() => {
    const root = rootRef.current;
    const lit = litRefs.current.slice(0, 3);
    const flash = flashRef.current, ring = ringRef.current, fill = fillRef.current;
    if (!root || !flash || !ring || !fill ||
        lit.length !== 3 || lit.some(c => !c)) return;

    const duration = durationMs(root);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, completed = false, elapsed = 0, last = 0, raf = 0;

    const settle = () => {
      lit.forEach(c => c!.setAttribute("opacity", "0"));
      flash.setAttribute("opacity", "0");
      ring.setAttribute("opacity", "0");
      fill.setAttribute("opacity", "1");
      fill.setAttribute("r", String(G.radius * 1.2));
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || reduced.matches || completed) return;
      if (last) elapsed += Math.min(now - last, 64);
      last = now;
      const phase = clamp(elapsed / duration);

      // Cada círculo se enciende con su color y se apaga: el contorno
      // pasa de gris delgado a más ancho con su color de marca. El
      // siguiente empieza antes de que el anterior se apague del todo.
      P.on.forEach((w, i) => {
        const v = smooth(w[0], w[1], phase) * (1 - smooth(w[2], w[3], phase));
        lit[i]!.setAttribute("opacity", String(v));
      });

      // Pulse en el centro: avisa que el recorrido terminó.
      const pulseT = clamp((phase - P.pulse[0]) / (P.pulse[1] - P.pulse[0]));
      const pulsePeak = Math.sin(Math.PI * pulseT);
      const inPulse = phase > P.pulse[0] && phase < P.pulse[1] ? 1 : 0;
      flash.setAttribute("opacity", String(pulsePeak * 0.7 * inPulse));
      flash.setAttribute("r", String(18 + 55 * pulseT));
      ring.setAttribute("r", String(10 + 100 * pulseT));
      ring.setAttribute("opacity", String(inPulse * (1 - pulseT) * 0.85));

      // La intersección se rellena del líquido del mesh.
      const fi = smooth(P.fillIn[0], P.fillIn[1], phase);
      fill.setAttribute("opacity", String(fi));
      fill.setAttribute("r", String(fi * G.radius * 1.2));

      if (phase < 1) raf = requestAnimationFrame(tick);
      else { completed = true; settle(); }
    };

    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };
    const run = (isVisible: boolean) => {
      visible = isVisible;
      stop();
      if (reduced.matches || completed) settle();
      else if (visible) raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => run(entry.isIntersecting), { threshold: .12 }
    );
    observer.observe(root);
    const onReduced = () => run(visible);
    reduced.addEventListener("change", onReduced);
    return () => { stop(); observer.disconnect(); reduced.removeEventListener("change", onReduced); };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <svg className={styles.svg} viewBox={`0 0 ${G.width} ${G.height}`}
        role="img" aria-label={lang === "es"
          ? "Diseño, Tecnología y Usabilidad: cada círculo se enciende con su color en secuencia y la intersección se rellena del líquido del mesh."
          : "Design, Technology and Usability: each circle lights up in its color in sequence and the intersection fills with the mesh liquid."}>
        <defs>
          {/* El líquido del mesh: mismo degradado del hero. */}
          <linearGradient id={fillId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop stopColor={HERO_MESH.blue} />
            <stop offset=".4" stopColor={HERO_MESH.cyan} />
            <stop offset=".67" stopColor={HERO_MESH.ice} />
            <stop offset=".85" stopColor={HERO_MESH.orange} />
            <stop offset="1" stopColor={HERO_MESH.blue} />
          </linearGradient>
          <radialGradient id={flashId}>
            <stop stopColor={HERO_MESH.ice} stopOpacity=".8" />
            <stop offset=".4" stopColor={HERO_MESH.cyan} stopOpacity=".48" />
            <stop offset="1" stopColor={HERO_MESH.blue} stopOpacity="0" />
          </radialGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={clipD}><circle cx={G.design.x} cy={G.design.y} r={G.radius} /></clipPath>
          <clipPath id={clipT}><circle cx={G.technology.x} cy={G.technology.y} r={G.radius} /></clipPath>
          <clipPath id={clipU}><circle cx={G.usability.x} cy={G.usability.y} r={G.radius} /></clipPath>
        </defs>

        {/* Círculos base: línea gris delgada, el estado "apagado". */}
        {CENTERS.map(c => (
          <circle key={`base-${c.x}-${c.y}`} className={styles.circle}
            cx={c.x} cy={c.y} r={G.radius} />
        ))}

        {/* Contorno encendido: mismo círculo, más ancho y con su color
            de marca. Solo se ve mientras "prende". */}
        <g filter={`url(#${glowId})`} aria-hidden="true">
          {CENTERS.map((c, i) => (
            <circle key={`lit-${c.x}-${c.y}`}
              ref={el => { litRefs.current[i] = el; }}
              className={styles.litCircle} cx={c.x} cy={c.y} r={G.radius}
              opacity="0" stroke={LIT_COLORS[i]} />
          ))}
        </g>

        {/* Pulse: destello + anillo que se expande en el centro. */}
        <circle ref={flashRef} cx={G.convergence.x} cy={G.convergence.y}
          r="0" opacity="0" fill={`url(#${flashId})`} aria-hidden="true" />
        <circle ref={ringRef} cx={G.convergence.x} cy={G.convergence.y}
          r="0" opacity="0" fill="none" stroke={HERO_MESH.cyan}
          className={styles.pulseRing} aria-hidden="true" />

        {/* La intersección se rellena del líquido del mesh: el gradiente
            solo se ve en el volumen compartido por los tres círculos. */}
        <g clipPath={`url(#${clipD})`}>
          <g clipPath={`url(#${clipT})`}>
            <g clipPath={`url(#${clipU})`}>
              <circle ref={fillRef} cx={G.convergence.x} cy={G.convergence.y}
                r="0" opacity="0" fill={`url(#${fillId})`} />
            </g>
          </g>
        </g>

        <text className={styles.circleLabel} x={G.design.x - G.radius * .42}
          y={G.design.y} textAnchor="middle">{lang === "es" ? "Diseño" : "Design"}</text>
        <text className={styles.circleLabel} x={G.technology.x + G.radius * .42}
          y={G.technology.y} textAnchor="middle">{lang === "es" ? "Tecnología" : "Technology"}</text>
        <text className={styles.circleLabel} x={G.usability.x}
          y={G.usability.y + G.radius * .55} textAnchor="middle">{lang === "es" ? "Usabilidad" : "Usability"}</text>
      </svg>
    </div>
  );
}
