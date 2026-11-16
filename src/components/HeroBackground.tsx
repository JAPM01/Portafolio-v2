"use client";

import { useEffect, useRef, useState } from "react";
import { MeshGradient, FlutedGlass, flutedGlassPresets } from "@paper-design/shaders-react";

// El preset "Waves" no se re-exporta por nombre desde el índice del paquete;
// se toma del arreglo de presets (el índice sí exporta flutedGlassPresets).
const wavesPreset =
  flutedGlassPresets.find((p) => p.name === "Waves") ?? flutedGlassPresets[0];

/** Fondo del hero: mesh gradient animado + fluted glass (waves) encima.
    El fluted distorsiona un frame real del mismo mesh, capturado del canvas
    en vivo, así vidrio y fondo comparten paleta y formas. Si la captura
    falla, el fluted no se monta y queda solo el mesh (que ya se ve bien). */

/* Paleta de identidad de Jafet (16 Nov 2026): negro y azul como base
   prioritaria, rojo de acento y cian solo para brillos. */
const MESH_COLORS = ["#000000", "#1100ff", "#000000", "#1100ff", "#fe0149", "#00d0f0"];
const STATIC_FRAME = 12000; // ms: punto de partida determinista (también para reduced-motion)
const CAPTURE_W = 960;
const CAPTURE_H = 540;

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

  // Captura un frame del mesh en vivo (downscaleado) como imagen del fluted.
  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const capture = () => {
      if (cancelled) return;
      const canvas = meshWrapRef.current?.querySelector("canvas");
      if (!canvas || canvas.width === 0) {
        if (tries++ < 12) timer = setTimeout(capture, 300);
        return;
      }
      try {
        const off = document.createElement("canvas");
        off.width = CAPTURE_W;
        off.height = CAPTURE_H;
        const ctx = off.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(canvas, 0, 0, CAPTURE_W, CAPTURE_H);
        const url = off.toDataURL("image/png");
        // Un canvas vacío da un PNG diminuto; reintentar si sale así.
        if (url.length > 20000) setFrameUrl(url);
        else if (tries++ < 12) timer = setTimeout(capture, 300);
      } catch {
        /* sin fluted: el mesh solo ya se ve bien */
      }
    };
    timer = setTimeout(capture, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div
        ref={meshWrapRef}
        style={{ position: "absolute", inset: 0, background: "#0A0A0E" }}
        aria-hidden="true"
      >
        <MeshGradient
          width="100%"
          height="100%"
          colors={MESH_COLORS}
          distortion={1}
          swirl={0.5}
          grainMixer={0.5}
          grainOverlay={0.5}
          speed={reducedMotion ? 0 : 0.86}
          frame={STATIC_FRAME}
          scale={0.5}
          rotation={100}
          offsetX={0}
          offsetY={0}
          fit="cover"
          minPixelRatio={1}
          maxPixelCount={1200000}
          webGlContextAttributes={{ preserveDrawingBuffer: true }}
        />
      </div>
      {frameUrl && (
        <div style={{ position: "absolute", inset: 0, opacity: 0.62 }} aria-hidden="true">
          <FlutedGlass
            {...wavesPreset.params}
            image={frameUrl}
            width="100%"
            height="100%"
            fit="cover"
            minPixelRatio={1}
            maxPixelCount={1200000}
          />
        </div>
      )}
    </>
  );
}
