import { SectionTitle } from "./SectionTitle";
import { useInView } from "../../hooks/use-motion-prefs";

const BRANDS = ["HALCYON", "orbital", "NORDA", "vectra/", "Mareo", "KILN&CO", "LUMA.OS", "Atlas"];
const METRICS = [
  { v: "11", s: "+", l: ["Años práctica", "independiente"] },
  { v: "50", s: "+", l: ["Marcas y", "proyectos"] },
  { v: "200k", s: "+", l: ["Usuarios", "impactados"] },
];

export function Experience() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  return (
    <section id="experience" className="px-5 py-20 md:px-10 md:py-28" aria-label="Experiencia y marcas">
      <SectionTitle num="03" label="Experiencia" title="Independent Practice • 11 Years" />
      <div ref={ref} className={`mt-10 md:mt-14 ${inView ? "is-in" : ""}`}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
          {METRICS.map((m, i) => (
            <div key={m.v} data-fx className="fx-metric" style={{ "--k": i } as React.CSSProperties}>
              <span className="reveal-line block text-[clamp(64px,8vw,120px)] font-medium leading-[0.85] tracking-[-0.07em]">
                <span style={{ transitionDelay: `${i * 120}ms` }}>{m.v}<span className="text-muted-foreground">{m.s}</span></span>
              </span>
              <span className="mt-3 block font-mono text-[11px] uppercase leading-relaxed text-muted-foreground">{m.l[0]} {m.l[1]}</span>
            </div>
          ))}
        </div>
        <p data-fx className="fx-rise mt-12 max-w-[62ch] text-[clamp(24px,2.8vw,38px)] font-medium leading-[1.15] tracking-[-0.035em] text-muted-foreground">
          Once años sin agencia de por medio. <span className="text-foreground">Estrategia, sistema y código</span> en una sola mano. Dirijo producto junto a fundadores y equipos in-house, <span className="text-foreground">del primer workshop al último commit.</span>
        </p>
      </div>
      <div data-fx className="fx-brands mt-12 grid grid-cols-2 border-l border-t md:grid-cols-4">
        {BRANDS.map((name, i) => (
          <div key={name} style={{ "--k": i } as React.CSSProperties} className="fx-brand group relative grid h-28 place-items-center border-b border-r md:h-36">
            <span className="font-display text-[22px] font-medium uppercase tracking-[0.08em] text-foreground opacity-40 transition duration-500 group-hover:opacity-100 md:text-[26px]">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
