"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

/**
 * Imagen de proyecto deformada como la "cinta" (ribbon) de Melon
 * (revisión técnica, 19 Nov 2026): Melon deforma las tarjetas con un
 * shader WebGL2 (sheet S-curve + lean + dent + luz). Aquí se reproduce
 * la deformación VISIBLE con la misma matemática de la hoja
 * (sheetShape de Melon) en un canvas 2D: la imagen se corta en franjas
 * horizontales y cada franja se proyecta en perspectiva según su
 * profundidad z, con luz/sombra según la pendiente. Sin WebGL.
 *
 * sheetShape(q) = mix(1-q², sin(πq), C) * exp(-tail·q²), C=0.5, tail=0.8.
 * warp: progreso del centro de la tarjeta respecto al centro del
 * viewport (-0.6..0.6). La fuerza es mínima en el centro y máxima en
 * los bordes; el sentido se invierte arriba/abajo del centro.
 */
export type WarpHandle = { draw: (warp: number) => void };

const SHEET_C = 0.15; // casi cuenco (arco único); la S de Melon es suave
const SHEET_TAIL = 0.8;
const FOCAL = 1200; // perspectiva, como el rotateX anterior
const AMP = 0.1; // amplitud de la deformación (× alto de la tarjeta)
const STEP = 2; // alto de cada franja en px

function sheetShape(q: number): number {
  const bowl = 1 - q * q;
  const sine = Math.sin(Math.PI * q);
  const mixed = bowl * (1 - SHEET_C) + sine * SHEET_C;
  return mixed * Math.exp(-SHEET_TAIL * q * q);
}

const WarpImage = forwardRef<
  WarpHandle,
  { src: string; alt: string; className?: string }
>(function WarpImage({ src, alt, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const loadedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    draw(warp: number) {
      const canvas = canvasRef.current;
      const off = offRef.current;
      const img = imgRef.current;
      if (!canvas || !off || !img || !loadedRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) return;

      // Fuerza: la lámina siempre está doblada (también centrada); la
      // fase de la S viaja con el progreso para que el punto de máxima
      // curvatura se desplace a lo largo de la tarjeta al hacer scroll.
      const p = Math.max(-0.6, Math.min(0.6, warp));
      const strength = 0.7 + 0.3 * Math.min(1, Math.abs(p) / 0.6);
      const phase = p * 1.2;
      const D = AMP * H * strength;
      // Torsión diagonal (Melon: borde sup. e inf. desplazados 30-60px).
      const twist = p * 0.15;
      // Oscurecimiento al salir por arriba (Melon: casi negra al salir).
      const darken = 0.45 * Math.max(0, -p / 0.6);

      const zAt = (v: number) => D * sheetShape(v - phase);

      ctx.clearRect(0, 0, W, H);
      const rows = Math.ceil(H / STEP);
      let prevY: number | null = null;
      for (let i = 0; i <= rows; i++) {
        const srcY = Math.min(H, i * STEP);
        const v = (srcY / H) * 2 - 1;
        const z = zAt(v);
        const s = FOCAL / (FOCAL + z);
        const yPrime = (srcY - H / 2) * s + H / 2;
        if (prevY === null) {
          prevY = yPrime;
          continue;
        }
        const y0 = prevY;
        const y1 = yPrime;
        prevY = yPrime;
        const h = y1 - y0;
        if (h <= 0.01) continue;
        // Ancho aparente (la franja se estrecha al alejarse) + torsión
        // diagonal (desplazamiento lateral según la fila).
        const dw = W * s;
        const dx = (W - dw) / 2 + twist * (srcY - H / 2);
        ctx.drawImage(off, 0, srcY - STEP, W, STEP, dx, y0, dw, h + 1);
        // Luz/sombra por la pendiente (dz/dv): la superficie que se
        // inclina hacia la luz se aclara, la que se aleja se oscurece.
        // color-mix con tokens (el guard de color prohíbe rgba()).
        const eps = 0.02;
        const slope =
          (zAt(Math.min(1, v + eps)) - zAt(Math.max(-1, v - eps))) / (2 * eps);
        const light = Math.max(-0.28, Math.min(0.28, -slope * 0.0016));
        if (light > 0.004) {
          ctx.fillStyle = `color-mix(in oklch, var(--brand-white) ${(light * 100).toFixed(1)}%, transparent)`;
          ctx.fillRect(dx, y0, dw, h + 1);
        } else if (light < -0.004) {
          ctx.fillStyle = `color-mix(in oklch, var(--brand-black) ${(-light * 100).toFixed(1)}%, transparent)`;
          ctx.fillRect(dx, y0, dw, h + 1);
        }
      }
      // Oscurecimiento global al salir por arriba.
      if (darken > 0.004) {
        ctx.fillStyle = `color-mix(in oklch, var(--brand-black) ${(darken * 100).toFixed(1)}%, transparent)`;
        ctx.fillRect(0, 0, W, H);
      }
    },
  }));

  // Carga la imagen y la dibuja (cover) en el canvas offscreen.
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      loadedRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
      paintOffscreen();
    };
    img.src = src;
    imgRef.current = img;
    return () => {
      loadedRef.current = false;
      imgRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  function paintOffscreen() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loadedRef.current) return;
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;
    let off = offRef.current;
    if (!off) {
      off = document.createElement("canvas");
      offRef.current = off;
    }
    off.width = W;
    off.height = H;
    const octx = off.getContext("2d");
    if (!octx) return;
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    octx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  }

  // Tamaño del canvas según la caja (DPR cap 1.5); al cambiar, repintar.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      paintOffscreen();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={alt} />;
});

export default WarpImage;
