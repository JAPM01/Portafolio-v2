import { useEffect, useState } from "react";
import { SectionTitle } from "./SectionTitle";
import { useInView, useReducedMotion } from "../../hooks/use-motion-prefs";

const BRANDS = ["HALCYON", "orbital", "NORDA", "vectra/", "Mareo", "KILN&CO", "LUMA.OS", "Atlas"];
const METRICS = [
  { n: 11, unit: "", s: "+", l: ["Años práctica", "independiente"] },
  { n: 50, unit: "", s: "+", l: ["Marcas y", "proyectos"] },
  { n: 200, unit: "k", s: "+", l: ["Usuarios", "impactados"] },
];

/** Count-up al entrar en viewport (ease-out cúbico, ~1.4s). Con
    prefers-reduced-motion muestra el valor final sin animar. */
function CountUp({ value, start }: { value: number; start: boolean }) {
  const [n, setN] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduced) { setN(value); return; }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value, reduced]);
  return <>{n}</>;
}

export function Experience() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const [brandsRef, brandsInView] = useInView<HTMLDivElement>(0.2);
  return (
    <section id="experience" className="content-shell py-20 md:py-28" aria-label="Experiencia y marcas">
      <SectionTitle num="03" label="Experiencia" title="Independent Practice • 11 Years" />
      <div ref={ref} className={`mt-10 md:mt-14 ${inView ? "is-in" : ""}`}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {METRICS.map((m, i) => (
            <div key={m.n} data-fx className="fx-metric" style={{ "--k": i } as React.CSSProperties}>
              <span className="reveal-line display-text block text-[clamp(64px,8vw,120px)] leading-[0.85] tracking-[-0.04em]">
                <span style={{ transitionDelay: `${i * 120}ms` }}><CountUp value={m.n} start={inView} />{m.unit}<span className="text-muted-foreground">{m.s}</span></span>
              </span>
              <span className="mt-3 block font-mono text-xs uppercase leading-relaxed text-muted-foreground">{m.l[0]} {m.l[1]}</span>
            </div>
          ))}
        </div>
        <p data-fx className="fx-rise display-text mt-12 max-w-[62ch] text-[clamp(24px,2.8vw,38px)] leading-[1.15] tracking-[-0.02em] text-muted-foreground">
          Once años sin agencia de por medio. <span className="text-foreground">Estrategia, sistema y código</span> en una sola mano. Dirijo producto junto a fundadores y equipos in-house, <span className="text-foreground">del primer workshop al último commit.</span>
        </p>
      </div>
      <div ref={brandsRef} className={`exp-brands mt-12 grid grid-cols-2 border-l border-t md:grid-cols-4 ${brandsInView ? "is-in" : ""}`}>
        {BRANDS.map((name, i) => (
          <div key={name} style={{ "--k": i } as React.CSSProperties} className="fx-brand group relative grid h-28 place-items-center border-b border-r md:h-36">
            <span className="brand-arrow" aria-hidden>↗</span>
            <span className="brand-name font-display text-[22px] font-medium uppercase tracking-[0.08em] text-foreground opacity-40 transition duration-500 group-hover:opacity-100 md:text-[26px]">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
