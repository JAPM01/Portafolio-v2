"use client";

import { memo, useEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass, flutedGlassPresets } from "@paper-design/shaders-react";

// El preset "Waves" no se re-exporta por nombre desde el índice del paquete;
// se toma del arreglo de presets (el índice sí exporta flutedGlassPresets).
const wavesPreset =
  flutedGlassPresets.find((p) => p.name === "Waves") ?? flutedGlassPresets[0];

/** Fondo del hero: mesh líquido + fluted glass (waves) encima, como la
    referencia. El mesh se mueve solo (animación) y con el mouse (offset y
    rotación con seguimiento suave), y el glass distorsiona frames REALES del
    mesh capturados en vivo cada ~100 ms: el vidrio muestra el mesh
    moviéndose detrás, no una foto fija. Si la captura falla, el fluted no se
    monta y queda solo el mesh (que ya se ve bien). */

/* Config del mesh (Jafet, playground de paper.design, 16 Nov 2026). */
const MESH_COLORS = ["#000000", "#1100ff", "#000000", "#fe0149", "#00d0f0"];
const STATIC_FRAME = 12000; // ms: punto de partida determinista (también para reduced-motion)
const CAPTURE_W = 480; // px: el glass no necesita más resolución que esta
const CAPTURE_MS = 100; // ~10 fps en escritorio
const CAPTURE_MS_COARSE = 160; // ~6 fps en táctil, para cuidar batería
const MOUSE_RANGE = 0.12; // desplazamiento máx. del mesh con el mouse
const MOUSE_ROTATION = 6; // grados extra de rotación con el mouse

/** Mesh con mouse: el gradiente se desplaza con el puntero (offset + leve
    rotación) con seguimiento suave (lerp). Componente aparte para que sus
    re-renders a 60 fps no toquen al glass. */
function MeshLayer({ reducedMotion }: { reducedMotion: boolean }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const renderedRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      targetRef.current = {
        x: Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1)),
        y: Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1)),
      };
    };
    const onLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    let raf = 0;
    const tick = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      c.x += (t.x - c.x) * 0.07;
      c.y += (t.y - c.y) * 0.07;
      const r = renderedRef.current;
      if (Math.abs(c.x - r.x) > 0.002 || Math.abs(c.y - r.y) > 0.002) {
        renderedRef.current = { x: c.x, y: c.y };
        setMouse({ x: c.x, y: c.y });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <MeshGradient
      width="100%"
      height="100%"
      colors={MESH_COLORS}
      distortion={0.35}
      swirl={0.25}
      grainMixer={0.08}
      grainOverlay={0.04}
      speed={reducedMotion ? 0 : 0.8}
      frame={STATIC_FRAME}
      scale={0.7}
      rotation={25 + mouse.x * MOUSE_ROTATION}
      offsetX={mouse.x * MOUSE_RANGE}
      offsetY={mouse.y * MOUSE_RANGE}
      fit="cover"
      minPixelRatio={1}
      maxPixelCount={1200000}
      webGlContextAttributes={{ preserveDrawingBuffer: true }}
    />
  );
}

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
