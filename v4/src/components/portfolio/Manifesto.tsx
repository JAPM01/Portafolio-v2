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
    <section id="manifesto" ref={secRef} className="relative overflow-hidden px-5 py-24 md:px-10 md:py-32" aria-label="Manifiesto">
      <SectionTitle num="02" label="Manifiesto" title="Design at the edge of utility & form" />
      <div className="mt-14 grid items-center gap-12 md:mt-20 md:grid-cols-12 md:gap-x-6">
        <div ref={textRef} className={`md:col-span-4 md:col-start-4 ${inView ? "is-in" : ""}`}>
          <p data-fx className="fx-words text-[clamp(28px,3vw,46px)] font-medium leading-[1.08] tracking-[-0.04em]">
            <ScrollWords parts={[
              { text: "Craft lives in what nobody sees" },
              { text: " — the edge case, the empty state, the ", tone: "muted" },
              { text: "token" },
              { text: " that makes ten products feel like ", tone: "muted" },
              { text: "one." },
            ]} />
          </p>
        </div>
        <div data-fx className="fx-venn relative md:col-span-5">
          <div ref={vennRef} className="relative mx-auto aspect-square w-[112%] max-w-none -mx-[6%] md:w-[140%] md:-mx-[20%]">
            {show3D ? (
              
                <Suspense fallback={<VennFallback />}>
                  <VennLenses lite={tier === "lite"} active={onScreen && !reduced} />
                </Suspense>
              
            ) : <VennFallback />}
            <div className="pointer-events-none absolute inset-0 font-mono text-[11px] uppercase">
              <span className="absolute left-1/2 top-[8%] -translate-x-1/2">Producto</span>
              <span className="absolute left-[2%] bottom-[10%]">Diseño</span>
              <span className="absolute right-[2%] bottom-[10%]">Código</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
