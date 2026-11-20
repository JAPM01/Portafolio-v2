"use client";
import { useRef, type ReactNode } from "react";

/**
 * Magnetic wrapper: the child is pulled toward the pointer while hovered
 * (strength 0.35) and springs back on leave. rAF-lerped, no deps.
 */
export default function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const running = useRef(false);

  const tick = () => {
    const c = cur.current;
    const t = target.current;
    c.x += (t.x - c.x) * 0.18;
    c.y += (t.y - c.y) * 0.18;
    if (innerRef.current) innerRef.current.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;
    if (Math.abs(t.x - c.x) < 0.1 && Math.abs(t.y - c.y) < 0.1) {
      running.current = false;
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const start = () => {
    if (!running.current) {
      running.current = true;
      raf.current = requestAnimationFrame(tick);
    }
  };

  return (
    <span
      ref={wrapRef}
      className="inline-block"
      onPointerMove={(e) => {
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        target.current.x = (e.clientX - (r.left + r.width / 2)) * strength;
        target.current.y = (e.clientY - (r.top + r.height / 2)) * strength;
        start();
      }}
      onPointerLeave={() => {
        target.current.x = 0;
        target.current.y = 0;
        start();
      }}
    >
      <span ref={innerRef} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  );
}
