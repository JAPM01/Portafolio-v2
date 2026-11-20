import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowDown, Copy } from "lucide-react";
import { pointer } from "../../lib/pointer";
import { CONTACT } from "../../lib/projects";
import { useGpuTier, useOnScreen, useReducedMotion } from "../../hooks/use-motion-prefs";
import { copyEmail } from "./copy-email";

const HeroChrome = lazy(() => import("../three/HeroChrome"));

export function Hero() {
  const tier = useGpuTier();
  const reduced = useReducedMotion();
  const [secRef, onScreen] = useOnScreen<HTMLElement>();
  const fluteRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
      if (coordRef.current) coordRef.current.textContent = `X ${pointer.x.toFixed(2)} · Y ${pointer.y.toFixed(2)}`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    let raf = 0;
    const loop = () => {
      const dx = (pointer.sx - 0.5) * -28, dy = (pointer.sy - 0.5) * -14;
      if (fluteRef.current) fluteRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      const y = window.scrollY;
      if (titleRef.current && y < window.innerHeight * 1.2) {
        const lines = titleRef.current.querySelectorAll<HTMLElement>("[data-line]");
        lines.forEach((l, i) => { l.style.transform = `translate3d(${y * (i % 2 ? -0.12 : 0.08)}px, ${y * -0.15}px, 0)`; });
        titleRef.current.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
      }
      // Without WebGL the smoothing must still advance for the flute parallax
      pointer.sx += (pointer.x - pointer.sx) * 0.06; pointer.sy += (pointer.y - pointer.sy) * 0.06;
      raf = requestAnimationFrame(loop);
    };
    if (!reduced) raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, [reduced]);

  const show3D = tier === "full" || tier === "lite";
  return (
    <section id="top" ref={secRef} data-fx className="fx-hero chrome-fallback relative h-[100svh] min-h-[640px] overflow-hidden" data-scene-ready={ready || tier === "none" ? "" : undefined}>
      {show3D && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          
            <Suspense fallback={null}>
              <HeroChrome lite={tier === "lite"} active={onScreen && !reduced} onReady={() => setReady(true)} />
            </Suspense>
          
        </div>
      )}
      {!show3D && <div ref={fluteRef} className="flute pointer-events-none absolute inset-0 will-change-transform" aria-hidden />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" aria-hidden />

      <div className="relative flex h-full flex-col justify-end px-5 pb-14 pt-28 md:px-10 md:pb-20">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex h-7 items-center gap-2 rounded-sm border bg-surface px-3 font-mono text-[11px] uppercase">
            <span className="h-1 w-1 bg-highlight" /><span ref={coordRef}>X 040 · Y 0000</span>
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase text-status">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-status" />Open Q1 2027
          </span>
          <span className="ml-auto hidden font-mono text-[11px] text-muted-foreground md:inline">HG_SHADER · {tier === "lite" ? "LITE" : "60FPS"}</span>
        </div>
        <h1 ref={titleRef} className="mt-6 text-[clamp(52px,10.4vw,148px)] font-medium uppercase leading-[0.84] tracking-[-0.06em]">
          <span data-line className="block will-change-transform">Senior Product</span>
          <span data-line className="block will-change-transform">Designer <span className="text-highlight">&amp;</span></span>
          <span data-line className="block will-change-transform">Brand Architect</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button onClick={copyEmail} className="group inline-flex items-center gap-2 font-mono text-[13px] hover:text-muted-foreground" aria-label={`Copiar email ${CONTACT.email}`}>
            {CONTACT.email}<Copy size={13} className="opacity-50 group-hover:opacity-100" />
          </button>
          <a href="#work" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase text-muted-foreground hover:text-foreground">
            <ArrowDown size={13} /> Scroll · Trabajo seleccionado
          </a>
        </div>
      </div>
    </section>
  );
}
