"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Custom magnetic cursor: a small difference-blend dot that follows the
 * pointer with lerp, and expands into a blue "VIEW CASE" badge over work
 * cards (elements with data-cursor="view"). Fine pointers only; touch
 * devices keep the native cursor.
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [viewing, setViewing] = useState(false);
  const pos = useRef({ x: -100, y: -100, tx: -100, ty: -100 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      setViewing(Boolean(t?.closest?.('[data-cursor="view"]')));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    let raf = 0;
    const loop = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.22;
      p.y += (p.ty - p.y) * 0.22;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      if (badgeRef.current) badgeRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2.5 w-2.5 rounded-full bg-white mix-blend-difference"
        style={{ opacity: viewing ? 0 : 1 }}
      />
      <div
        ref={badgeRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] grid h-[88px] w-[88px] place-items-center rounded-full bg-[#000aff] text-center transition-[opacity,scale] duration-200"
        style={{ opacity: viewing ? 1 : 0, scale: viewing ? "1" : "0.6" }}
      >
        <span className="mono text-[10px] font-medium tracking-widest text-white">
          VIEW
          <br />
          CASE
        </span>
      </div>
    </>
  );
}
