"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./dev-bubble.module.css";

/** Clave de localStorage para la posición de la burbuja. */
const DEV_BUBBLE_POS_KEY = "portafolio-devtools-pos";

/** Mantiene un punto dentro del viewport, con 8px de margen. */
function clampToViewport(
  el: HTMLElement | null,
  x: number,
  y: number
): { x: number; y: number } {
  const w = el?.offsetWidth ?? 120;
  const h = el?.offsetHeight ?? 36;
  const maxX = Math.max(8, window.innerWidth - w - 8);
  const maxY = Math.max(8, window.innerHeight - h - 8);
  return { x: Math.min(Math.max(8, x), maxX), y: Math.min(Math.max(8, y), maxY) };
}

export interface DevBubbleProps {
  /** Si la retícula está visible (el estado vive en el padre). */
  visible: boolean;
  /** Se llama al hacer clic en la burbuja (sin arrastrar). */
  onToggle: () => void;
}

/** Burbuja flotante de herramientas de desarrollo (NO es parte del diseño):
    position fixed, arrastrable con pointer capture, con su posición
    guardada en localStorage. Es dueña solo de su UI flotante/arrastrable
    y su posición; el estado de cada herramienta vive en el padre.
    Hoy contiene solo el toggle de la retícula; más herramientas van como
    hermanas de .devToolsToggle dentro de este contenedor. */
export default function DevBubble({ visible, onToggle }: DevBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  /* pos null = posición por defecto del CSS (abajo a la derecha, elevada
     sobre el meta). */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    /* Cargar la posición guardada (si existe) y mantenerla en pantalla. */
    try {
      const raw = window.localStorage.getItem(DEV_BUBBLE_POS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const next = clampToViewport(bubbleRef.current, parsed.x, parsed.y);
          posRef.current = next;
          setPos(next);
        }
      }
    } catch {
      /* localStorage no disponible o dato corrupto: posición por defecto. */
    }
    const onResize = () => {
      setPos((prev) => {
        if (!prev) return prev;
        const next = clampToViewport(bubbleRef.current, prev.x, prev.y);
        posRef.current = next;
        return next;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = bubbleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };
    /* Pointer capture: los pointermove/up siguen llegando a la burbuja
       aunque el puntero salga de ella durante el arrastre. */
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) <= 4) {
      return; /* Umbral de 4px: un clic sin mover no es un arrastre. */
    }
    if (!drag.moved) {
      drag.moved = true;
      setIsDragging(true);
    }
    const next = clampToViewport(
      bubbleRef.current,
      e.clientX - drag.offsetX,
      e.clientY - drag.offsetY
    );
    posRef.current = next;
    setPos(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (drag.moved) {
      /* Fue un arrastre: no hacer toggle y guardar la posición final.
         El flag evita que el click que sigue al arrastre haga toggle;
         se limpia solo por si ese click no llega. */
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 500);
      try {
        if (posRef.current) {
          window.localStorage.setItem(DEV_BUBBLE_POS_KEY, JSON.stringify(posRef.current));
        }
      } catch {
        /* localStorage no disponible: la posición solo vive en la sesión. */
      }
    }
    /* Si no se movió, el click del contenedor hace el toggle. */
  };

  const onClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onToggle();
  };

  return (
    <div
      ref={bubbleRef}
      className={`${styles.devTools}${isDragging ? ` ${styles.devToolsDragging}` : ""}`}
      style={
        pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined
      }
      role="group"
      aria-label="Herramientas de desarrollo"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <span className={styles.devToolsGrip} aria-hidden="true">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor">
          <circle cx="2" cy="2" r="1.2" />
          <circle cx="6" cy="2" r="1.2" />
          <circle cx="2" cy="7" r="1.2" />
          <circle cx="6" cy="7" r="1.2" />
          <circle cx="2" cy="12" r="1.2" />
          <circle cx="6" cy="12" r="1.2" />
        </svg>
      </span>
      <button
        type="button"
        className={styles.devToolsToggle}
        data-devtool="grid-toggle"
        aria-pressed={visible}
        aria-label={visible ? "Ocultar retícula" : "Ver retícula"}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        <span>Retícula</span>
      </button>
      {/* Más herramientas de desarrollo: añadir aquí su propio <button>
          con aria-pressed, como hermano de .devToolsToggle. */}
    </div>
  );
}
