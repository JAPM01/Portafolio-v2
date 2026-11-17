"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getHeaderPreview,
  getHeaderPreviewStatus,
  getServerHeaderPreview,
  getServerHeaderPreviewStatus,
  setHeaderPreview,
  subscribeHeaderPreview,
  subscribeHeaderPreviewStatus,
} from "../lib/header-preview";
import styles from "./dev-bubble.module.css";

const DEV_BUBBLE_POS_KEY = "portafolio-devtools-pos";

function clampToViewport(
  el: HTMLElement | null,
  x: number,
  y: number
): { x: number; y: number } {
  const w = el?.offsetWidth ?? 160;
  const h = el?.offsetHeight ?? 40;
  return {
    x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - w - 8)),
    y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - h - 8)),
  };
}

export interface DevBubbleProps {
  visible: boolean;
  onToggle: () => void;
}

/** Movable development menu: comparison modes are mutually exclusive.
 * Retícula stays independent. No production navigation controls change.
 */
export default function DevBubble({ visible, onToggle }: DevBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const selected = useSyncExternalStore(
    subscribeHeaderPreview,
    getHeaderPreview,
    getServerHeaderPreview
  );
  const status = useSyncExternalStore(
    subscribeHeaderPreviewStatus,
    getHeaderPreviewStatus,
    getServerHeaderPreviewStatus
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEV_BUBBLE_POS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          const clamped = clampToViewport(bubbleRef.current, parsed.x, parsed.y);
          posRef.current = clamped;
          setPos(clamped);
        }
      }
    } catch {
      // The menu remains usable without storage.
    }

    function onResize() {
      setPos((previous) => {
        if (!previous) return null;
        const next = clampToViewport(bubbleRef.current, previous.x, previous.y);
        posRef.current = next;
        return next;
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function handleGripDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleGripMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    if (!dragging && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
    setDragging(true);
    const next = clampToViewport(
      bubbleRef.current,
      e.clientX - d.offsetX,
      e.clientY - d.offsetY
    );
    posRef.current = next;
    setPos(next);
  }

  function handleGripUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (posRef.current) {
      try {
        localStorage.setItem(DEV_BUBBLE_POS_KEY, JSON.stringify(posRef.current));
      } catch {
        // Optional preference.
      }
    }
  }

  return (
    <div
      ref={bubbleRef}
      className={`${styles.devTools}${dragging ? ` ${styles.devToolsDragging}` : ""}`}
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
      role="group"
      data-liquid-ignore=""
      data-liquid-glass-ignore=""
      aria-label="Herramientas de desarrollo"
    >
      <button
        type="button"
        className={styles.devToolsGrip}
        aria-label="Arrastrar herramientas de desarrollo"
        title="Arrastrar"
        onPointerDown={handleGripDown}
        onPointerMove={handleGripMove}
        onPointerUp={handleGripUp}
        onPointerCancel={handleGripUp}
      >
        <svg width="8" height="14" viewBox="0 0 8 14" fill="currentColor" aria-hidden="true">
          {[2, 7, 12].map((y) => (
            <g key={y}><circle cx="2" cy={y} r="1.2" /><circle cx="6" cy={y} r="1.2" /></g>
          ))}
        </svg>
      </button>
      <button
        type="button"
        className={styles.devToolsToggle}
        aria-expanded={open}
        aria-controls="jpm-devtools-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M1 1h5v5H1zM8 1h5v5H8zM1 8h5v5H1zM8 8h5v5H8z" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span>Herramientas</span>
        <svg width="12" height="12" viewBox="0 0 12 12" className={open ? styles.chevronOpen : ""} aria-hidden="true">
          <path d="m2.5 4.5 3.5 3 3.5-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div id="jpm-devtools-panel" className={styles.panel}>
          <div className={styles.panelHeading}>
            <span>Desarrollo</span>
            <span className={styles.panelMeta}>Vista previa</span>
          </div>
          <button
            type="button"
            className={styles.menuOption}
            aria-pressed={visible}
            onClick={onToggle}
          >
            <span className={styles.optionCopy}><strong>Retícula</strong><small>Mostrar cuadrícula del hero</small></span>
            <span className={`${styles.switch}${visible ? ` ${styles.switchOn}` : ""}`} aria-hidden="true" />
          </button>
          <div className={styles.separator} />
          <button
            type="button"
            className={styles.menuOption}
            aria-pressed={selected === "header1"}
            onClick={() => setHeaderPreview(selected === "header1" ? "original" : "header1")}
          >
            <span className={styles.optionCopy}><strong>Header 1</strong><small>liquidGL · WebGPU / WebGL</small></span>
            <span className={`${styles.switch}${selected === "header1" ? ` ${styles.switchOn}` : ""}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.menuOption}
            aria-pressed={selected === "header2"}
            onClick={() => setHeaderPreview(selected === "header2" ? "original" : "header2")}
          >
            <span className={styles.optionCopy}><strong>Header 2</strong><small>Simple Liquid Glass · WebGL</small></span>
            <span className={`${styles.switch}${selected === "header2" ? ` ${styles.switchOn}` : ""}`} aria-hidden="true" />
          </button>
          <p className={styles.status} role="status">
            {selected === "original" ? "Header actual" : status || "Motor pendiente; desplázate para verlo"}
          </p>
          <p className={styles.status}>Las cápsulas se activan al hacer scroll.</p>
        </div>
      )}
    </div>
  );
}
