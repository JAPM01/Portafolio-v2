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
  particle: { length: 54, thickness: 9, blur: 2.2 },
} as const;

type Center = typeof G.design | typeof G.technology | typeof G.usability;
const point = (p: Point) => `${p.x} ${p.y}`;

function crossings(a: Center, b: Center): [Point, Point] {
  const dx = b.x - a.x, dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  const h = Math.sqrt(G.radius ** 2 - (d / 2) ** 2);
  const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
  return [
    { x: x - dy / d * h, y: y + dx / d * h },
    { x: x + dy / d * h, y: y - dx / d * h },
  ];
}

const designToTechnology = crossings(G.design, G.technology)
  .reduce((a, b) => a.y < b.y ? a : b);
const technologyToUsability = crossings(G.technology, G.usability)
  .reduce((a, b) => a.x > b.x ? a : b);

function fullOrbit(center: Center, start: Point) {
  const opposite = { x: 2 * center.x - start.x, y: 2 * center.y - start.y };
  return [
    `M ${point(start)}`,
    `A ${G.radius} ${G.radius} 0 0 1 ${point(opposite)}`,
    `A ${G.radius} ${G.radius} 0 0 1 ${point(start)}`,
  ].join(" ");
}

function connectOnCircle(center: Center, start: Point, end: Point) {
  const initial = Math.atan2(start.y - center.y, start.x - center.x);
  const final = Math.atan2(end.y - center.y, end.x - center.x);
  const sweep = (final - initial + Math.PI * 4) % (Math.PI * 2);
  const large = sweep > Math.PI ? 1 : 0;
  return `M ${point(start)} A ${G.radius} ${G.radius} 0 ${large} 1 ${point(end)}`;
}

/** Cinco segmentos enlazados exactamente en sus extremos:
 *  órbita Diseño → órbita Tecnología → enlace circular →
 *  órbita Usabilidad → convergencia interior. */
const TRACKS = [
  fullOrbit(G.design, designToTechnology),
  fullOrbit(G.technology, designToTechnology),
  connectOnCircle(G.technology, designToTechnology, technologyToUsability),
  fullOrbit(G.usability, technologyToUsability),
  [
    `M ${point(technologyToUsability)}`,
    `C ${technologyToUsability.x} ${technologyToUsability.y + G.radius * .12},`,
    `${G.convergence.x + G.radius * .46} ${G.convergence.y + G.radius * .38},`,
    point(G.convergence),
  ].join(" "),
] as const;

const T = {
  begin: .04,
  end: .82,
  impact: .83,
  flashEnd: .92,
  fillStart: .86,
  fillEnd: .98,
} as const;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
function smooth(a: number, b: number, t: number) {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}
const legEase = (t: number) => t * .3 + smooth(0, 1, t) * .7;

function durationMs(el: HTMLElement) {
  const value = getComputedStyle(el).getPropertyValue("--motion-diagram-cycle").trim();
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration) || duration <= 0) return 24000;
  return value.endsWith("ms") ? duration : duration * 1000;
}

export default function VennFlow({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(SVGPathElement | null)[]>([]);
  const particleRef = useRef<SVGGElement>(null);
  const fillRef = useRef<SVGCircleElement>(null);
  const flashRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const outcomeRef = useRef<SVGTextElement>(null);

  const id = useId().replace(/:/g, "");
  const beamId = `venn-beam-${id}`;
  const blurId = `venn-blur-${id}`;
  const fillId = `venn-fill-${id}`;
  const flashId = `venn-flash-${id}`;
  const clipD = `venn-d-${id}`;
  const clipT = `venn-t-${id}`;
  const clipU = `venn-u-${id}`;

  useEffect(() => {
    const root = rootRef.current, particle = particleRef.current;
    const fill = fillRef.current, flash = flashRef.current;
    const ring = ringRef.current, outcome = outcomeRef.current;
    const paths = trackRefs.current.slice(0, TRACKS.length);
    if (!root || !particle || !fill || !flash || !ring || !outcome ||
        paths.length !== TRACKS.length || paths.some(p => !p)) return;

    const sections = (paths as SVGPathElement[]).map(path => ({
      path, length: path.getTotalLength(),
    }));
    const total = sections.reduce((n, section) => n + section.length, 0);
    if (!total) return;

    const duration = durationMs(root);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, completed = false, elapsed = 0, last = 0, raf = 0;

    const settle = () => {
      particle.setAttribute("opacity", "0");
      fill.setAttribute("opacity", "1");
      fill.setAttribute("r", String(G.radius * 1.2));
      flash.setAttribute("opacity", "0");
      ring.setAttribute("opacity", "0");
      outcome.setAttribute("opacity", "1");
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || reduced.matches || completed) return;
      if (last) elapsed += Math.min(now - last, 64);
      last = now;
      const phase = clamp(elapsed / duration);

      // Una pequeña partícula, orientada por la tangente real al círculo.
      const distance = clamp((phase - T.begin) / (T.end - T.begin)) * total;
      let remaining = distance, current = sections[sections.length - 1];
      let local = 1;
      for (const section of sections) {
        if (remaining <= section.length) {
          current = section;
          local = legEase(remaining / section.length);
          break;
        }
        remaining -= section.length;
      }
      const pathPosition = local * current.length;
      const at = current.path.getPointAtLength(pathPosition);
      const before = current.path.getPointAtLength(Math.max(0, pathPosition - 1.5));
      const after = current.path.getPointAtLength(Math.min(current.length, pathPosition + 1.5));
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
      particle.setAttribute("transform", `translate(${at.x} ${at.y}) rotate(${angle})`);

      const appearance = smooth(T.begin * .5, T.begin + .025, phase) *
        (1 - smooth(T.end - .012, T.impact + .02, phase));
      particle.setAttribute("opacity", String(appearance));

      const pulse = Math.max(0, Math.sin(Math.PI * clamp(
        (phase - T.impact) / (T.flashEnd - T.impact)
      )));
      flash.setAttribute("opacity", String(pulse * .68));
      flash.setAttribute("r", String(G.radius * (.13 + .31 * smooth(T.impact, T.flashEnd, phase))));
      ring.setAttribute("opacity", String(pulse * .68));
      ring.setAttribute("r", String(G.radius * (.04 + .28 * smooth(T.impact, T.flashEnd, phase))));

      const reveal = smooth(T.fillStart, T.fillEnd, phase);
      fill.setAttribute("opacity", String(reveal));
      fill.setAttribute("r", String(reveal * G.radius * 1.2));
      outcome.setAttribute("opacity", String(reveal));

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
          ? "Diseño, Tecnología y Usabilidad: una partícula recorre los tres círculos y culmina en la intersección común."
          : "Design, Technology and Usability: a particle orbits each circle and finishes at their shared intersection."}>
        <defs>
          {TRACKS.map((d, i) => (
            <path key={i} d={d} ref={element => { trackRefs.current[i] = element; }} />
          ))}

          {/* La textura pertenece al propio beam: mismo color desde
              el primer hasta el último punto, independientemente de
              dónde se encuentre en el diagrama. */}
          <linearGradient id={beamId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={HERO_MESH.blue} stopOpacity="0" />
            <stop offset="18%" stopColor={HERO_MESH.blue} stopOpacity=".85" />
            <stop offset="40%" stopColor={HERO_MESH.cyan} stopOpacity=".96" />
            <stop offset="57%" stopColor={HERO_MESH.ice} />
            <stop offset="76%" stopColor={HERO_MESH.cyan} />
            <stop offset="88%" stopColor={HERO_MESH.orange} stopOpacity=".78" />
            <stop offset="100%" stopColor={HERO_MESH.blue} stopOpacity="0" />
          </linearGradient>
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
          <filter id={blurId} x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation={G.particle.blur} />
          </filter>
          <clipPath id={clipD}><circle cx={G.design.x} cy={G.design.y} r={G.radius} /></clipPath>
          <clipPath id={clipT}><circle cx={G.technology.x} cy={G.technology.y} r={G.radius} /></clipPath>
          <clipPath id={clipU}><circle cx={G.usability.x} cy={G.usability.y} r={G.radius} /></clipPath>
        </defs>

        <circle className={styles.circle} cx={G.design.x} cy={G.design.y} r={G.radius} />
        <circle className={styles.circle} cx={G.technology.x} cy={G.technology.y} r={G.radius} />
        <circle className={styles.circle} cx={G.usability.x} cy={G.usability.y} r={G.radius} />

        {/* El gradiente llena únicamente el volumen compartido por los tres. */}
        <g clipPath={`url(#${clipD})`}>
          <g clipPath={`url(#${clipT})`}>
            <g clipPath={`url(#${clipU})`}>
              <circle ref={fillRef} cx={G.convergence.x} cy={G.convergence.y}
                r="0" opacity="0" fill={`url(#${fillId})`} />
            </g>
          </g>
        </g>

        {/* Beam corto (54x9 en unidades del SVG) y halo de 2.2 unidades.
            SVG puro: no se renderiza ni recorta un canvas WebGL gigante. */}
        <g ref={particleRef} opacity="0" aria-hidden="true">
          <rect x={-G.particle.length / 2} y={-G.particle.thickness / 2}
            width={G.particle.length} height={G.particle.thickness}
            rx={G.particle.thickness / 2} opacity=".4"
            fill={`url(#${beamId})`} filter={`url(#${blurId})`} />
          <rect x={-G.particle.length / 2} y={-G.particle.thickness / 2}
            width={G.particle.length} height={G.particle.thickness}
            rx={G.particle.thickness / 2} fill={`url(#${beamId})`} />
        </g>
        <circle ref={flashRef} cx={G.convergence.x} cy={G.convergence.y}
          r="0" opacity="0" fill={`url(#${flashId})`} aria-hidden="true" />
        <circle ref={ringRef} cx={G.convergence.x} cy={G.convergence.y}
          r="0" opacity="0" fill="none" stroke={HERO_MESH.cyan}
          className={styles.pulseRing} aria-hidden="true" />

        <text className={styles.circleLabel} x={G.design.x - G.radius * .42}
          y={G.design.y} textAnchor="middle">{lang === "es" ? "Diseño" : "Design"}</text>
        <text className={styles.circleLabel} x={G.technology.x + G.radius * .42}
          y={G.technology.y} textAnchor="middle">{lang === "es" ? "Tecnología" : "Technology"}</text>
        <text className={styles.circleLabel} x={G.usability.x}
          y={G.usability.y + G.radius * .55} textAnchor="middle">{lang === "es" ? "Usabilidad" : "Usability"}</text>
        <text ref={outcomeRef} className={styles.resultLabel} x={G.convergence.x}
          y={G.convergence.y} textAnchor="middle" opacity="0">
          {lang === "es" ? "Resultado" : "Outcome"}
        </text>
      </svg>
    </div>
  );
}
