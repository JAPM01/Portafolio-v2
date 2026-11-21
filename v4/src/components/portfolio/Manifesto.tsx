import { lazy, Suspense, useEffect, useRef } from "react";
import { SectionTitle } from "./SectionTitle";
import { ScrollWords } from "./ScrollFX";
import { scrollState } from "../../lib/pointer";
import { useGpuTier, useInView, useOnScreen, useReducedMotion } from "../../hooks/use-motion-prefs";

const VennLenses = lazy(() => import("../three/VennLenses"));

function VennFallback() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]" aria-hidden>
      {[["50%", "30%"], ["32%", "62%"], ["68%", "62%"]].map(([l, t], i) => (
        <div key={i} className="absolute h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/25 bg-gradient-to-br from-foreground/15 via-transparent to-highlight/10 backdrop-blur-sm" style={{ left: l, top: t }} />
      ))}
    </div>
  );
}

export function Manifesto() {
  const tier = useGpuTier();
  const reduced = useReducedMotion();
  const [vennRef, onScreen] = useOnScreen<HTMLDivElement>();
  const [textRef, inView] = useInView<HTMLDivElement>(0.3);
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const on = () => {
      const el = secRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      scrollState.manifesto = Math.min(1, Math.max(0, 1 - (r.top + r.height) / (window.innerHeight + r.height)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const show3D = tier === "full" || tier === "lite";
  return (
    <section id="manifesto" ref={secRef} className="content-shell relative overflow-hidden py-20 md:py-28" aria-label="Manifiesto">
      <SectionTitle num="02" label="Manifiesto" title="Design at the edge of utility & form" />
      <div className="mt-10 grid items-center gap-12 md:mt-14 md:grid-cols-12 md:gap-x-6">
        <div ref={textRef} className={`md:col-span-5 md:col-start-1 ${inView ? "is-in" : ""}`}>
          <p data-fx className="fx-words display-text text-[clamp(28px,3vw,46px)] leading-[1.08] tracking-[-0.02em]">
            <ScrollWords parts={[
              { text: "Craft lives in what nobody sees" },
              { text: " — the edge case, the empty state, the ", tone: "muted" },
              { text: "token" },
              { text: " that makes ten products feel like ", tone: "muted" },
              { text: "one.", tone: "muted" },
            ]} />
          </p>
        </div>
        <div data-fx className="fx-venn relative md:col-span-6 md:col-start-7">
          <div ref={vennRef} className="relative mx-auto aspect-square w-full max-w-[560px]">
            {show3D ? (
              
                <Suspense fallback={<VennFallback />}>
                  <VennLenses lite={tier === "lite"} active={onScreen && !reduced} />
                </Suspense>
              
            ) : <VennFallback />}
            <div className="pointer-events-none absolute inset-0 font-mono text-xs uppercase">
              <span className="absolute left-1/2 top-[28%] -translate-x-1/2">Producto</span>
              <span className="absolute left-[34%] top-[61%] -translate-x-1/2">Diseño</span>
              <span className="absolute left-[66%] top-[61%] -translate-x-1/2">Código</span>
              <span className="absolute left-1/2 top-[48%] -translate-x-1/2 text-foreground/70">Punto dulce</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
