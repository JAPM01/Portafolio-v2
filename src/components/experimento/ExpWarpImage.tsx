"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { tokenHex } from "./colorTokens";

/**
 * Imagen de proyecto deformada como la "cinta" (ribbon) de Melon
 * (config del shader WebGL2 de Melon, ribbon-a.js, 19 Nov 2026):
 * VEL_NORM 400, V_SMOOTH .35, VTWIST .9, VEL_BULGE .5, DEPTH .12,
 * SPAN 1.15, DIAG_X .18, BANK -.1, DOOR -.06, DENT .065, SPEC .31,
 * DIFF .3, GLOSS 48, shadeA .5.
 *
 * Driver = VELOCIDAD de scroll (no posición): la fuerza es
 * tanh(vel/400)^2, con signo según la dirección. La S de la hoja es
 * completa (SHEET_C = 1), no un cuenco. Además: torsión diagonal
 * (DIAG_X), lean/bank (BANK) y dent bajo el cursor (DENT .065,
 * radio .24, sigue al puntero). El oscurecimiento al salir por arriba
 * sí depende de la posición (progreso del centro de la tarjeta).
 *
 * sheetShape(q) = mix(1-q², sin(πq), C) * exp(-tail·q²), C=1, tail=0.8.
 */
export type WarpState = {
  /** Velocidad de scroll suavizada, px/s (con signo). */
  vel: number;
  /** Progreso del centro de la tarjeta vs centro del viewport (-0.6..0.6). */
  progress: number;
  /** Posición del puntero dentro de la tarjeta, en px de canvas. */
  dentX: number;
  dentY: number;
  dentActive: boolean;
};

export type WarpHandle = { draw: (state: WarpState) => void };

const SHEET_C = 1; // S completa de Melon (antes 0.15, casi cuenco)
const SHEET_TAIL = 0.8;
const FOCAL = 1200;
const AMP = 0.12; // DEPTH .12 de Melon (× alto de la tarjeta)
const STEP = 2; // alto de cada franja en px
const DENT = 0.065;
const DENT_R = 0.24;

function sheetShape(q: number): number {
  const bowl = 1 - q * q;
  const sine = Math.sin(Math.PI * q);
  const mixed = bowl * (1 - SHEET_C) + sine * SHEET_C;
  return mixed * Math.exp(-SHEET_TAIL * q * q);
}

const WarpImage = forwardRef<
  WarpHandle,
  { src: string; alt: string; className?: string; onLoad?: () => void }
>(function WarpImage({ src, alt, className, onLoad }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const loadedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    draw(state: WarpState) {
      const canvas = canvasRef.current;
      const off = offRef.current;
      const img = imgRef.current;
      if (!canvas || !off || !img || !loadedRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) return;

      // Fuerza por velocidad: tanh(vel/400)^2, con signo de dirección.
      const vSigned = Math.tanh(state.vel / 400);
      const v = vSigned * vSigned;
      const dir = state.vel >= 0 ? 1 : -1;
      // La lámina siempre está doblada; la velocidad la acentúa (bulge .5).
      const strength = 0.55 + 0.45 * v;
      const phase = dir * (0.35 + 0.55 * v);
      const D = AMP * H * strength;
      // Torsión diagonal (Melon: bordes desplazados 30-60px) y lean/bank.
      const twistPx = dir * (30 + 30 * v);
      const bankPx = -0.1 * dir * v * 60;
      // Oscurecimiento al salir por arriba (posición, no velocidad).
      const p = Math.max(-0.6, Math.min(0.6, state.progress));
      const darken = 0.45 * Math.max(0, -p / 0.6);

      const zAt = (vv: number, srcY: number) => {
        let z = D * sheetShape(vv - phase);
        // Dent bajo el cursor (gaussiana vertical, radio .24 del alto).
        if (state.dentActive) {
          const dy = (srcY - state.dentY) / (DENT_R * H);
          z -= D * DENT * 10 * Math.exp(-dy * dy);
        }
        return z;
      };
      // Colores resueltos en runtime (ver colorTokens.ts): el canvas NO
      // resuelve var() en fillStyle y un color-mix con var() se ignora,
      // dejando negro sólido. Se usa globalAlpha para la opacidad.
      const whiteHex = tokenHex("--brand-white");
      const blackHex = tokenHex("--brand-black");

      ctx.clearRect(0, 0, W, H);
      const rows = Math.ceil(H / STEP);
      let prevY: number | null = null;
      for (let i = 0; i <= rows; i++) {
        const srcY = Math.min(H, i * STEP);
        const vv = (srcY / H) * 2 - 1;
        const z = zAt(vv, srcY);
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
        // diagonal + bank (desplazamiento lateral según la fila).
        const dw = W * s;
        const rel = (srcY - H / 2) / H;
        const dx = (W - dw) / 2 + twistPx * rel + bankPx * rel;
        ctx.drawImage(off, 0, srcY - STEP, W, STEP, dx, y0, dw, h + 1);
        // Luz/sombra por la pendiente (dz/dv): la superficie que se
        // inclina hacia la luz se aclara, la que se aleja se oscurece.
        const eps = 0.02;
        const slope =
          (zAt(Math.min(1, vv + eps), srcY) - zAt(Math.max(-1, vv - eps), srcY)) /
          (2 * eps);
        const light = Math.max(-0.28, Math.min(0.28, -slope * 0.0016));
        if (light > 0.004) {
          ctx.globalAlpha = light;
          ctx.fillStyle = whiteHex;
          ctx.fillRect(dx, y0, dw, h + 1);
          ctx.globalAlpha = 1;
        } else if (light < -0.004) {
          ctx.globalAlpha = -light;
          ctx.fillStyle = blackHex;
          ctx.fillRect(dx, y0, dw, h + 1);
          ctx.globalAlpha = 1;
        }
      }
      // Oscurecimiento global al salir por arriba.
      if (darken > 0.004) {
        ctx.globalAlpha = darken;
        ctx.fillStyle = blackHex;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    },
  }));

  // Carga la imagen y la dibuja (cover) en el canvas offscreen.
  // La media es 16/9 y la fuente 1280x720 (16/9): cover = imagen completa.
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
      onLoad?.();
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
