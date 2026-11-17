"use client";

import { useEffect, useId, useRef } from "react";
import { HERO_MESH } from "../lib/hero-mesh";
import styles from "./venn-flow.module.css";

type Lang = "es" | "en";
type Point = { x: number; y: number };

/** Geometría en coordenadas SVG, independiente del layout CSS. */
const G = {
  width: 640,
  height: 530,
  radius: 142,
  design: { x: 240, y: 188 },
  technology: { x: 400, y: 188 },
  usability: { x: 320, y: 315 },
  convergence: { x: 320, y: 252 },
  liquidRadius: 58,
} as const;

const CENTERS = [G.design, G.technology, G.usability] as const;

/**
 * Ventanas de la animación, en fracción del ciclo (8 s):
 * cada círculo se enciende (contorno más ancho + degradado del mesh)
 * y se apaga, uno por uno; luego el centro hace el pulse que avisa
 * que el recorrido terminó y deja el líquido en la convergencia.
 * Los círculos NUNCA se rellenan: solo su contorno prende.
 */
const P = {
  on: [
    [0.02, 0.07, 0.17, 0.23],
    [0.21, 0.26, 0.36, 0.42],
    [0.40, 0.45, 0.55, 0.61],
  ],
  pulse: [0.63, 0.78],
  liquidIn: [0.78, 0.90],
} as const;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
function smooth(a: number, b: number, t: number) {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}
function easeOutBack(t: number) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Gota orgánica: contorno cerrado y suave con radio modulado. */
function blobPath(cx: number, cy: number, r: number) {
  const N = 10;
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const w = 1 + 0.09 * Math.sin(3 * a + 0.7) + 0.05 * Math.cos(5 * a);
    pts.push({ x: cx + Math.cos(a) * r * w, y: cy + Math.sin(a) * r * w });
  }
  const mid = (p: Point, q: Point) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(mid(pts[N - 1], pts[0]).x)} ${f(mid(pts[N - 1], pts[0]).y)}`;
  for (let i = 0; i < N; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % N]);
    d += ` Q ${f(p.x)} ${f(p.y)} ${f(m.x)} ${f(m.y)}`;
  }
  return `${d} Z`;
}

const LIQUID_D = blobPath(G.convergence.x, G.convergence.y, G.liquidRadius);

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
  const liquidRef = useRef<SVGPathElement>(null);

  const id = useId().replace(/:/g, "");
  const meshId = `venn-mesh-${id}`;
  const liquidId = `venn-liquid-${id}`;
  const flashId = `venn-flash-${id}`;
  const glowId = `venn-glow-${id}`;
  const softId = `venn-soft-${id}`;

  useEffect(() => {
    const root = rootRef.current;
    const lit = litRefs.current.slice(0, 3);
    const flash = flashRef.current, ring = ringRef.current, liquid = liquidRef.current;
    if (!root || !flash || !ring || !liquid ||
        lit.length !== 3 || lit.some(c => !c)) return;

    const duration = durationMs(root);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, completed = false, elapsed = 0, last = 0, raf = 0;

    const settle = () => {
      lit.forEach(c => c!.setAttribute("opacity", "0"));
      flash.setAttribute("opacity", "0");
      ring.setAttribute("opacity", "0");
      liquid.setAttribute("opacity", "1");
      liquid.setAttribute("transform", "");
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || reduced.matches || completed) return;
      if (last) elapsed += Math.min(now - last, 64);
      last = now;
      const phase = clamp(elapsed / duration);

      // Cada círculo se enciende y se apaga: el contorno pasa de gris
      // delgado a más ancho con el degradado del mesh. El siguiente
      // empieza antes de que el anterior se apague del todo.
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

      // El líquido cae en la convergencia y se queda ahí.
      const li = smooth(P.liquidIn[0], P.liquidIn[1], phase);
      const scale = 0.5 + 0.5 * easeOutBack(li);
      liquid.setAttribute("opacity", String(li));
      liquid.setAttribute("transform",
        `translate(${G.convergence.x} ${G.convergence.y}) scale(${scale.toFixed(3)}) translate(${-G.convergence.x} ${-G.convergence.y})`);

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
          ? "Diseño, Tecnología y Usabilidad: cada círculo se enciende en secuencia y el centro deja una gota del degradado del mesh."
          : "Design, Technology and Usability: each circle lights up in sequence and the center leaves a drop of the mesh gradient."}>
        <defs>
          {/* Un solo degradado espacial para todo el diagrama, como el
              mesh del hero: los tres círculos se leen como un flujo. */}
          <linearGradient id={meshId} gradientUnits="userSpaceOnUse"
            x1="120" y1="60" x2="520" y2="470">
            <stop offset="0%" stopColor={HERO_MESH.blue} />
            <stop offset="35%" stopColor={HERO_MESH.cyan} />
            <stop offset="55%" stopColor={HERO_MESH.ice} />
            <stop offset="75%" stopColor={HERO_MESH.cyan} />
            <stop offset="90%" stopColor={HERO_MESH.orange} />
            <stop offset="100%" stopColor={HERO_MESH.blue} />
          </linearGradient>
          <radialGradient id={liquidId} cx="50%" cy="42%" r="68%">
            <stop offset="0%" stopColor={HERO_MESH.ice} />
            <stop offset="32%" stopColor={HERO_MESH.cyan} />
            <stop offset="62%" stopColor={HERO_MESH.blue} />
            <stop offset="88%" stopColor={HERO_MESH.orange} stopOpacity=".9" />
            <stop offset="100%" stopColor={HERO_MESH.orange} stopOpacity="0" />
          </radialGradient>
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
          <filter id={softId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Círculos base: línea gris delgada, el estado "apagado". */}
        {CENTERS.map(c => (
          <circle key={`base-${c.x}-${c.y}`} className={styles.circle}
            cx={c.x} cy={c.y} r={G.radius} />
        ))}

        {/* Contorno encendido: mismo círculo, más ancho y con el
            degradado del mesh. Solo se ve mientras "prende". */}
        <g filter={`url(#${glowId})`} aria-hidden="true">
          {CENTERS.map((c, i) => (
            <circle key={`lit-${c.x}-${c.y}`}
              ref={el => { litRefs.current[i] = el; }}
              className={styles.litCircle} cx={c.x} cy={c.y} r={G.radius}
              opacity="0" stroke={`url(#${meshId})`} />
          ))}
        </g>

        {/* Pulse: destello + anillo que se expande en el centro. */}
        <circle ref={flashRef} cx={G.convergence.x} cy={G.convergence.y}
          r="0" opacity="0" fill={`url(#${flashId})`} aria-hidden="true" />
        <circle ref={ringRef} cx={G.convergence.x} cy={G.convergence.y}
          r="0" opacity="0" fill="none" stroke={HERO_MESH.cyan}
          className={styles.pulseRing} aria-hidden="true" />

        {/* El líquido: gota orgánica del mesh que queda en la
            convergencia cuando termina el recorrido. Sin recorte:
            es una gota, no un relleno de la intersección. */}
        <path ref={liquidRef} d={LIQUID_D} opacity="0"
          fill={`url(#${liquidId})`} filter={`url(#${softId})`} aria-hidden="true" />

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
