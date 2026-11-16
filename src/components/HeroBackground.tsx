"use client";

import { memo, useEffect, useRef, useState } from "react";
import { FlutedGlass, flutedGlassPresets } from "@paper-design/shaders-react";
import FluidBackground from "./FluidBackground";

// El preset por defecto es el de barras verticales (shape "lines", angle 0),
// como el glass de la referencia. Los presets no se re-exportan por nombre
// desde el índice del paquete; se toman del arreglo flutedGlassPresets.
const verticalBarsPreset =
  flutedGlassPresets.find((p) => p.name === "Default") ?? flutedGlassPresets[0];

/** Fondo del hero: tinta líquida viva (simulación de fluido WebGL) +
    fluted glass de barras verticales encima, como la referencia. El glass
    distorsiona frames REALES del fluido capturados en vivo cada ~100 ms: el
    vidrio muestra la tinta moviéndose detrás. Si la captura falla, el fluted
    no se monta y queda solo el fluido (que ya se ve bien). */

const CAPTURE_W = 480; // px: el glass no necesita más resolución que esta
const CAPTURE_MS = 100; // ~10 fps en escritorio
const CAPTURE_MS_COARSE = 160; // ~6 fps en táctil, para cuidar batería

/** El glass solo se re-renderiza cuando cambia su frame, no con el mouse. */
const GlassLayer = memo(function GlassLayer({ frame }: { frame: string | null }) {
  if (!frame) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.62 }} aria-hidden="true">
      <FlutedGlass
        {...verticalBarsPreset.params}
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
  const fluidWrapRef = useRef<HTMLDivElement>(null);
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

  // Alimenta el glass con frames reales del fluido en vivo: captura el canvas
  // del fluido (downscaleado a JPEG pequeño) en un intervalo. Con
  // reduced-motion el fluido es estático: basta una sola captura.
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    const capture = () => {
      if (cancelled || document.hidden) return;
      const wrap = fluidWrapRef.current;
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
        /* sin fluted: el fluido solo ya se ve bien */
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
        ref={fluidWrapRef}
        style={{ position: "absolute", inset: 0, background: "#0A0A0E" }}
        aria-hidden="true"
      >
        <FluidBackground reducedMotion={reducedMotion} />
      </div>
      <GlassLayer frame={frameUrl} />
    </>
  );
}
