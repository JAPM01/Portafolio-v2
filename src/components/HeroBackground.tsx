"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  FlutedGlass,
  flutedGlassPresets,
  MeshGradient,
} from "@paper-design/shaders-react";

// El mesh de la referencia ES un mesh gradient (paper-design, WebGL,
// líquido por sí solo: distortion + swirl + speed lo mueven). La config
// es la del playground de Jafet, exacta. El mouse SOLO desplaza el mesh
// un poco (transform del wrapper, sin pintar nada): la versión del fluido
// inyectaba tinta al pasar el mouse y eso era lo que generaba el humo
// morado. Aquí no hay splats ni tinte nuevo: imposible que salga humo.
const wavesPreset =
  flutedGlassPresets.find((p) => p.name === "Waves") ?? flutedGlassPresets[0];

/** El glass solo se re-renderiza cuando cambia su frame, no con el mouse. */
const GlassLayer = memo(function GlassLayer({ frame }: { frame: string | null }) {
  if (!frame) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.62 }} aria-hidden="true">
      <FlutedGlass
        {...wavesPreset.params}
        image={frame}
        width="100%"
        height="100%"
        fit="cover"
        minPixelRatio={1}
        maxPixelCount={1200000}
      />
    </div>
  );
});

/** MeshGradient con la config exacta del playground. El mouse solo lo
    empuja (translate ±8% + rotación ±4° con lerp); el líquido lo hace el
    propio shader (distortion, swirl, speed). */
function MeshLayer({ reducedMotion }: { reducedMotion: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    const tick = () => {
      if (!document.hidden) {
        current.x += (target.x - current.x) * 0.06;
        current.y += (target.y - current.y) * 0.06;
        const el = wrapRef.current;
        if (el) {
          el.style.transform = `translate3d(${(current.x * -8).toFixed(2)}%, ${(current.y * -8).toFixed(2)}%, 0) rotate(${(current.x * 4).toFixed(2)}deg)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: "-12%" }} aria-hidden="true">
      <MeshGradient
        width="100%"
        height="100%"
        colors={["#000000", "#1100ff", "#000000", "#fe0149", "#00d0f0"]}
        distortion={0.35}
        swirl={0.25}
        grainMixer={0.08}
        grainOverlay={0.04}
        speed={reducedMotion ? 0 : 0.8}
        scale={0.7}
        rotation={25}
        // width/height son CSS: "100%" llena el hero (con números quedaba
        // un canvas fijo de 1280×720 que no cubría todo el hero). Y sin
        // preserveDrawingBuffer el canvas WebGL se vacía tras componer y
        // la captura del glass salía en negro: por eso el glass no montaba.
        webGlContextAttributes={{ preserveDrawingBuffer: true }}
      />
    </div>
  );
}

const CAPTURE_W = 480; // px: el glass no necesita más resolución que esta
const CAPTURE_MS = 100; // ~10 fps en escritorio
const CAPTURE_MS_COARSE = 160; // ~6 fps en táctil, para cuidar batería

/** Fondo del hero: mesh gradient líquido (paper-design) + fluted glass
    Waves encima, como la referencia. El glass distorsiona frames REALES
    del mesh capturados en vivo cada ~100 ms: el vidrio muestra el mesh
    moviéndose detrás. Si la captura falla, el fluted no se monta y queda
    solo el mesh (que ya se ve bien). */
export default function HeroBackground() {
  const meshWrapRef = useRef<HTMLDivElement>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Lectura inicial diferida: setState síncrono dentro del efecto lo
    // marca el linter (cascading renders) y no hace falta en el 1er frame.
    const raf = requestAnimationFrame(() => setReducedMotion(mq.matches));
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  // Alimenta el glass con frames reales del mesh en vivo: captura el canvas
  // del mesh (downscaleado a JPEG pequeño) en un intervalo. Con
  // reduced-motion el mesh es estático: basta una sola captura.
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    const capture = () => {
      if (cancelled || document.hidden) return;
      const wrap = meshWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return; // hero fuera de vista
      const canvas = wrap.querySelector("canvas");
      if (!canvas || canvas.width === 0) return;
      try {
        const off = document.createElement("canvas");
        off.width = CAPTURE_W;
        off.height = Math.max(1, Math.round((CAPTURE_W * canvas.height) / canvas.width));
        const ctx = off.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(canvas, 0, 0, off.width, off.height);
        const url = off.toDataURL("image/jpeg", 0.72);
        // Un frame válido pesa varios KB; si sale diminuto, es un canvas vacío.
        if (url.length > 4000) setFrameUrl(url);
      } catch {
        /* sin fluted: el mesh solo ya se ve bien */
      }
    };
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const timer = setTimeout(() => {
      if (cancelled) return;
      capture();
      if (!reducedMotion) {
        interval = setInterval(capture, coarse ? CAPTURE_MS_COARSE : CAPTURE_MS);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [reducedMotion]);

  return (
    <>
      <div
        ref={meshWrapRef}
        style={{ position: "absolute", inset: 0, background: "#0A0A0E" }}
        aria-hidden="true"
      >
        <MeshLayer reducedMotion={reducedMotion} />
      </div>
      <GlassLayer frame={frameUrl} />
    </>
  );
}
