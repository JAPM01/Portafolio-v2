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
 * Ventanas de la animación, en fracción del ciclo (12 s, en loop):
 * cada círculo se enciende con su color y se apaga, uno por uno;
 * la intersección se rellena del líquido del mesh y ES ELLA la que
 * hace el pulse (late); queda unos segundos con el relleno y luego
 * se apaga para repetirse. Los círculos NUNCA se rellenan: solo su
 * contorno prende. No hay ningún círculo de pulse detrás.
 */
const P = {
  on: [
    [0.02, 0.05, 0.13, 0.17],
    [0.15, 0.18, 0.26, 0.30],
    [0.28, 0.31, 0.39, 0.43],
  ],
  fillIn: [0.45, 0.53],
  pulse: [0.53, 0.65],
  hold: [0.65, 0.90],
  fillOut: [0.90, 0.96],
} as const;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
function smooth(a: number, b: number, t: number) {
  const x = clamp((t - a) / (b - a));
  return x * x * (3 - 2 * x);
}

function durationMs(el: HTMLElement) {
  const value = getComputedStyle(el).getPropertyValue("--motion-diagram-cycle").trim();
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration) || duration <= 0) return 12000;
  return value.endsWith("ms") ? duration : duration * 1000;
}

export default function VennFlow({ lang }: { lang: Lang }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const litRefs = useRef<(SVGCircleElement | null)[]>([]);
  const fillRef = useRef<SVGGElement>(null);

  const id = useId().replace(/:/g, "");
  const cyanId = `venn-cyan-${id}`;
  const iceId = `venn-ice-${id}`;
  const orangeId = `venn-orange-${id}`;
  const glowId = `venn-glow-${id}`;
  const clipD = `venn-d-${id}`;
  const clipT = `venn-t-${id}`;
  const clipU = `venn-u-${id}`;

  useEffect(() => {
    const root = rootRef.current;
    const lit = litRefs.current.slice(0, 3);
    const fill = fillRef.current;
    if (!root || !fill || lit.length !== 3 || lit.some(c => !c)) return;

    const duration = durationMs(root);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, elapsed = 0, last = 0, raf = 0;

    // Estado final estático (solo para prefers-reduced-motion):
    // intersección llena, círculos apagados.
    const settle = () => {
      lit.forEach(c => c!.setAttribute("opacity", "0"));
      fill.setAttribute("opacity", "1");
      fill.setAttribute("transform", "");
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || reduced.matches) return;
      if (last) elapsed += Math.min(now - last, 64);
      last = now;
      // En loop: al terminar el ciclo se vuelve a empezar.
      if (elapsed >= duration) elapsed -= duration;
      const phase = clamp(elapsed / duration);

      // Cada círculo se enciende con su color y se apaga: el contorno
      // pasa de gris delgado a más ancho con su color de marca. El
      // siguiente empieza antes de que el anterior se apague del todo.
      P.on.forEach((w, i) => {
        const v = smooth(w[0], w[1], phase) * (1 - smooth(w[2], w[3], phase));
        lit[i]!.setAttribute("opacity", String(v));
      });

      // La intersección se rellena del líquido del mesh, late (el pulse
      // es ella misma, no hay ningún círculo detrás), queda unos
      // segundos con el relleno y luego se apaga para repetirse.
      // El líquido "florece" desde el centro al entrar.
      const fillIn = smooth(P.fillIn[0], P.fillIn[1], phase);
      const pulseT = clamp((phase - P.pulse[0]) / (P.pulse[1] - P.pulse[0]));
      const inPulse = phase > P.pulse[0] && phase < P.pulse[1] ? 1 : 0;
      // Latido doble y suave: la intersección se ilumina y se atenúa.
      const beat = inPulse * Math.pow(Math.sin(pulseT * Math.PI * 2), 2);
      const fillOut = 1 - smooth(P.fillOut[0], P.fillOut[1], phase);
      fill.setAttribute("opacity", String(fillIn * (1 - 0.25 * beat) * fillOut));
      const s = 0.5 + 0.5 * fillIn;
      fill.setAttribute("transform",
        `translate(${G.convergence.x} ${G.convergence.y}) scale(${s}) translate(${-G.convergence.x} ${-G.convergence.y})`);

      raf = requestAnimationFrame(tick);
    };

    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; };
    const run = (isVisible: boolean) => {
      visible = isVisible;
      stop();
      if (reduced.matches) settle();
      else if (visible) raf = requestAnimationFrame(tick);
    };
    // La animación inicia solo cuando TODO el diagrama está en el viewport.
    // Umbral 0.9 (no 1.0): en móvil el diagrama es 116% del contenedor,
    // más ancho que el viewport por diseño, así que el 100% de su área
    // nunca estaría visible y la animación jamás arrancaría. Con 0.9
    // arranca cuando el diagrama está esencialmente entero en vista.
    const observer = new IntersectionObserver(
      ([entry]) => run(entry.isIntersecting), { threshold: 0.9 }
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
          ? "Diseño, Tecnología y Usabilidad: cada círculo se enciende con su color en secuencia, la intersección se rellena del líquido del mesh, late y se repite."
          : "Design, Technology and Usability: each circle lights up in its color in sequence, the intersection fills with the mesh liquid, pulses and repeats."}>
        <defs>
          {/* El líquido del mesh, en miniatura: NO un degradado lineal
              (eso dejaba franjas: azul, blanco, naranja) sino las
              mismas manchas suaves y difusas del hero — campo azul,
              onda cian, brillo hielo y naranja en la esquina superior
              derecha. Cada mancha es un radial que se desvanece a
              transparente, así se funden como líquido, sin bordes. */}
          <radialGradient id={cyanId}>
            <stop offset="0" stopColor={HERO_MESH.cyan} stopOpacity="0.95" />
            <stop offset="0.7" stopColor={HERO_MESH.cyan} stopOpacity="0.5" />
            <stop offset="1" stopColor={HERO_MESH.cyan} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={iceId}>
            <stop offset="0" stopColor={HERO_MESH.ice} stopOpacity="1" />
            <stop offset="0.6" stopColor={HERO_MESH.ice} stopOpacity="0.85" />
            <stop offset="1" stopColor={HERO_MESH.ice} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={orangeId}>
            <stop offset="0" stopColor={HERO_MESH.orange} stopOpacity="0.9" />
            <stop offset="0.7" stopColor={HERO_MESH.orange} stopOpacity="0.45" />
            <stop offset="1" stopColor={HERO_MESH.orange} stopOpacity="0" />
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

        {/* La intersección se rellena del líquido del mesh: las manchas
            solo se ven en el volumen compartido por los tres círculos.
            Es ella la que late; no hay ningún círculo de pulse detrás. */}
        <g clipPath={`url(#${clipD})`}>
          <g clipPath={`url(#${clipT})`}>
            <g clipPath={`url(#${clipU})`}>
              <g ref={fillRef} opacity="0">
                {/* Campo azul del mesh. */}
                <rect x="200" y="120" width="240" height="240" fill={HERO_MESH.blue} />
                {/* Onda cian, mancha grande y suave. */}
                <ellipse cx="335" cy="240" rx="85" ry="75" fill={`url(#${cyanId})`} />
                {/* Brillo hielo: el núcleo luminoso del mesh. */}
                <ellipse cx="348" cy="228" rx="52" ry="46" fill={`url(#${iceId})`} />
                {/* Naranja en la esquina superior derecha, como el hero. */}
                <ellipse cx="380" cy="182" rx="42" ry="36" fill={`url(#${orangeId})`} />
              </g>
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
