"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./venn-flow.module.css";
import HeroBackground from "./HeroBackground";

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

/* El encuadre se deriva exclusivamente de la geometría del diagrama.
   Aire lateral mínimo (12 unidades por lado): el Venn llena casi
   toda su columna y se ve más grande, sin recortar los círculos. */
const DRAWING = {
  left: Math.min(...CENTERS.map(({ x }) => x - G.radius)),
  right: Math.max(...CENTERS.map(({ x }) => x + G.radius)),
  top: Math.min(...CENTERS.map(({ y }) => y - G.radius)),
  bottom: Math.max(...CENTERS.map(({ y }) => y + G.radius)),
};
const VIEW_WIDTH = DRAWING.right - DRAWING.left + 24;
const VIEW_HEIGHT = VIEW_WIDTH * (G.height / G.width);
const VIEW = {
  x: DRAWING.left - 12,
  y: (DRAWING.top + DRAWING.bottom - VIEW_HEIGHT) / 2,
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
} as const;

/* Las etiquetas son HTML, no texto SVG: así type-meta conserva
   su tamaño CSS real independientemente de la escala del dibujo. */
/* Recortes geométricos relativos al viewBox: se escalan sin romper la grid. */
function circleClip({ x, y }: { x: number; y: number }) {
  const percent = (value: number) => `${value * 100}%`;
  return `ellipse(${percent(G.radius / VIEW.width)} ${percent(G.radius / VIEW.height)} at ${percent((x - VIEW.x) / VIEW.width)} ${percent((y - VIEW.y) / VIEW.height)})`;
}

function labelPosition(x: number, y: number) {
  return {
    insetInlineStart: `${((x - VIEW.x) / VIEW.width) * 100}%`,
    insetBlockStart: `${((y - VIEW.y) / VIEW.height) * 100}%`,
  };
}

type Point = { x: number; y: number };

/* Intersección matemática de los tres círculos. Se calcula una sola vez:
   los vértices provienen de las intersecciones de pares y los extremos
   cardinales que pertenecen simultáneamente a los tres círculos. */
function tripleIntersectionBounds() {
  const r = G.radius;
  const inside = (p: Point) => CENTERS.every(c =>
    (p.x - c.x) ** 2 + (p.y - c.y) ** 2 <= r ** 2 + Number.EPSILON * 10000
  );
  const candidates: Point[] = [];
  for (let i = 0; i < CENTERS.length; i++) {
    const a = CENTERS[i];
    const cardinal: Point[] = [
      { x: a.x - r, y: a.y }, { x: a.x + r, y: a.y },
      { x: a.x, y: a.y - r }, { x: a.x, y: a.y + r },
    ];
    candidates.push(...cardinal.filter(inside));
    for (let j = i + 1; j < CENTERS.length; j++) {
      const c = CENTERS[j];
      const dx = c.x - a.x, dy = c.y - a.y;
      const d = Math.hypot(dx, dy);
      if (!d || d > 2 * r) continue;
      const h = Math.sqrt(r * r - (d / 2) ** 2);
      for (const sign of [-1, 1]) {
        const p = {
          x: (a.x + c.x) / 2 - sign * (dy / d) * h,
          y: (a.y + c.y) / 2 + sign * (dx / d) * h,
        };
        if (inside(p)) candidates.push(p);
      }
    }
  }
  if (!candidates.length) throw new Error("Venn: sin intersección triple");
  const left = Math.min(...candidates.map(p => p.x));
  const right = Math.max(...candidates.map(p => p.x));
  const top = Math.min(...candidates.map(p => p.y));
  const bottom = Math.max(...candidates.map(p => p.y));
  return {
    insetInlineStart: `${((left - VIEW.x) / VIEW.width) * 100}%`,
    insetBlockStart: `${((top - VIEW.y) / VIEW.height) * 100}%`,
    inlineSize: `${((right - left) / VIEW.width) * 100}%`,
    blockSize: `${((bottom - top) / VIEW.height) * 100}%`,
  };
}
const MESH_ARTWORK = tripleIntersectionBounds();

const LABELS = [
  { key: "design", x: G.design.x - G.radius / 2, y: G.design.y },
  { key: "technology", x: G.technology.x + G.radius / 2, y: G.technology.y },
  { key: "usability", x: G.usability.x, y: G.usability.y + G.radius / 2 },
] as const;


/* Cada círculo prende con SU color de marca: diseño naranja,
   tecnología azul, usabilidad cian. El contorno base permanece
   blanco; el color vive en el círculo que se enciende y en el mesh. */
const LIT_COLORS = [
  "var(--brand-orange)",
  "var(--brand-blue)",
  "var(--brand-cyan)",
] as const;

/**
 * Ventanas de la animación, en fracción del ciclo (18 s, en loop):
 * cada círculo se enciende con su color y se apaga, uno por uno;
 * la intersección se rellena del líquido del mesh y ES ELLA la que
 * hace el pulse (late); el mesh queda visible varios segundos antes
 * de apagarse para repetirse. Los círculos NUNCA se rellenan: solo su
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
  hold: [0.65, 0.93],
  fillOut: [0.93, 0.98],
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
  const innerLitRefs = useRef<(SVGCircleElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);

  const id = useId().replace(/:/g, "");
  const glowId = `venn-glow-${id}`;

  useEffect(() => {
    const root = rootRef.current;
    const lit = litRefs.current.slice(0, 3);
    const innerLit = innerLitRefs.current.slice(0, 3);
    const fill = fillRef.current;
    if (!root || !fill || lit.length !== 3 || innerLit.length !== 3 ||
        lit.some(c => !c) || innerLit.some(c => !c)) return;

    const duration = durationMs(root);
    // La traslación de los segmentos usa exclusivamente la escala existente.
    const travel = Number.parseFloat(getComputedStyle(root).getPropertyValue("--space-6"));
    const dashTravel = Number.isFinite(travel) ? travel : 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, elapsed = 0, last = 0, raf = 0;

    // Estado final estático (solo para prefers-reduced-motion):
    // intersección llena, círculos apagados.
    const settle = () => {
      lit.forEach(c => c!.setAttribute("opacity", "0"));
      innerLit.forEach(c => {
        c!.setAttribute("opacity", "0");
        c!.setAttribute("stroke-dashoffset", "0");
      });
      fill.style.opacity = "1";
      fill.style.transform = "none";
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || reduced.matches) return;
      const dt = last ? Math.min(now - last, 64) : 0;
      elapsed += dt;
      // El mesh fluye de forma continua mediante el shader real del Hero.
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
        // El anillo interior comparte EXACTAMENTE la activación del
        // contorno exterior: sin fases, delays ni duraciones adicionales.
        innerLit[i]!.setAttribute("opacity", String(v));
        const progress = clamp((phase - w[0]) / (w[3] - w[0]));
        innerLit[i]!.setAttribute("stroke-dashoffset", String(-progress * dashTravel));
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
      fill.style.opacity = String(fillIn * (1 - 0.25 * beat) * fillOut);
      const s = 0.5 + 0.5 * fillIn;
      fill.style.transform = `scale(${s})`;

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
    // Umbral bajo: también funciona en móvil con el diagrama ensanchado,
    // aunque parte de su superficie quede recortada por el viewport.
    const observer = new IntersectionObserver(
      ([entry]) => run(entry.isIntersecting), { threshold: 0.1 }
    );
    observer.observe(root);
    const onReduced = () => run(visible);
    reduced.addEventListener("change", onReduced);
    return () => { stop(); observer.disconnect(); reduced.removeEventListener("change", onReduced); };
  }, []);

  return (
    <div className={styles.root} ref={rootRef}>
      <div
        ref={fillRef}
        className={styles.meshFill}
        style={{ transformOrigin: `${((G.convergence.x - VIEW.x) / VIEW.width) * 100}% ${((G.convergence.y - VIEW.y) / VIEW.height) * 100}%` }}
        aria-hidden="true"
      >
        <div className={styles.meshClip} style={{ clipPath: circleClip(G.design) }}>
          <div className={styles.meshClip} style={{ clipPath: circleClip(G.technology) }}>
            <div className={styles.meshClip} style={{ clipPath: circleClip(G.usability) }}>
              {/* La intersección recibe el frame completo del Hero en
                  miniatura. Las tres máscaras originales lo recortan. */}
              <div className={styles.meshArtwork} style={MESH_ARTWORK}>
                <HeroBackground follow={0} referenceSpace="viewport" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg className={styles.svg} viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.width} ${VIEW.height}`}
        style={{ "--venn-ring-radius": `${G.radius}px` } as React.CSSProperties}
        role="img" aria-label={lang === "es"
          ? "Diseño, Tecnología y Usabilidad: cada círculo se enciende con su color en secuencia, la intersección se rellena del líquido del mesh, late y se repite."
          : "Design, Technology and Usability: each circle lights up in its color in sequence, the intersection fills with the mesh liquid, pulses and repeats."}>
        <defs>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Círculos blancos de FEFEFE, a través del token de marca. */}
        {CENTERS.map(c => (
          <circle key={`base-${c.x}-${c.y}`} className={styles.circle}
            cx={c.x} cy={c.y} r={G.radius} />
        ))}
        {/* Contornos internos segmentados: exactamente --space-2 hacia dentro. */}
        {CENTERS.map(c => (
          <circle key={`inner-${c.x}-${c.y}`} className={styles.innerRing}
            cx={c.x} cy={c.y} r={G.radius} />
        ))}

        {/* El pulso realza temporalmente el contorno con SU color de marca. */}
        <g filter={`url(#${glowId})`} aria-hidden="true">
          {CENTERS.map((c, i) => (
            <circle key={`lit-${c.x}-${c.y}`}
              ref={el => { litRefs.current[i] = el; }}
              className={styles.litCircle} cx={c.x} cy={c.y} r={G.radius}
              style={{ stroke: LIT_COLORS[i] }}
              opacity="0" />
          ))}
          {CENTERS.map((c, i) => (
            <circle key={`inner-lit-${c.x}-${c.y}`}
              ref={el => { innerLitRefs.current[i] = el; }}
              className={styles.innerLitRing}
              cx={c.x} cy={c.y} r={G.radius}
              style={{ stroke: LIT_COLORS[i] }}
              opacity="0" />
          ))}
        </g>

      </svg>
      <div className={styles.labels} aria-hidden="true">
        {LABELS.map((label) => (
          <span
            key={label.key}
            className={`type-meta ${styles.circleLabel}`}
            style={labelPosition(label.x, label.y)}
          >
            {label.key === "design"
              ? (lang === "es" ? "Diseño" : "Design")
              : label.key === "technology"
                ? (lang === "es" ? "Tecnología" : "Technology")
                : (lang === "es" ? "Usabilidad" : "Usability")}
          </span>
        ))}
      </div>
    </div>
  );
}
