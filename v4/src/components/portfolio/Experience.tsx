import { SectionTitle } from "./SectionTitle";
import { useInView } from "../../hooks/use-motion-prefs";

const BRANDS: { name: string; cls: string }[] = [
  { name: "HALCYON", cls: "tracking-[0.2em] font-semibold" },
  { name: "orbital", cls: "italic font-medium" },
  { name: "NORDA", cls: "font-semibold tracking-tight" },
  { name: "vectra/", cls: "font-mono" },
  { name: "Mareo", cls: "font-medium tracking-tighter" },
  { name: "KILN&CO", cls: "tracking-[0.15em]" },
  { name: "LUMA.OS", cls: "font-mono font-semibold" },
  { name: "Atlas", cls: "font-semibold italic tracking-tight" },
];
const METRICS = [
  { v: "11", s: "+", l: ["Años práctica", "independiente"] },
  { v: "50", s: "+", l: ["Marcas y", "proyectos"] },
  { v: "200k", s: "+", l: ["Usuarios", "impactados"] },
];

export function Experience() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  return (
    <section id="experience" className="px-5 py-24 md:px-10 md:py-32" aria-label="Experiencia y marcas">
      <SectionTitle num="03" label="Experiencia" title="Independent Practice • 11 Years" />
      <div ref={ref} className={`mt-14 grid gap-14 md:grid-cols-12 ${inView ? "is-in" : ""}`}>
        <div className="flex flex-col gap-10 md:col-span-5">
          {METRICS.map((m, i) => (
            <div key={m.v} data-fx className="fx-metric flex items-end gap-5" style={{ "--k": i } as React.CSSProperties}>
              <span className="reveal-line text-[clamp(88px,11vw,160px)] font-medium leading-[0.8] tracking-[-0.07em]">
                <span style={{ transitionDelay: `${i * 120}ms` }}>{m.v}<span className="text-muted-foreground">{m.s}</span></span>
              </span>
              <span className="pb-2 font-mono text-[11px] uppercase leading-relaxed text-muted-foreground">{m.l[0]}<br />{m.l[1]}</span>
            </div>
          ))}
        </div>
        <div data-fx className="fx-rise md:col-span-6 md:col-start-7 md:pt-4">
          <p className="text-[clamp(24px,2.8vw,38px)] font-medium leading-[1.15] tracking-[-0.035em] text-muted-foreground">
            Once años sin agencia de por medio. <span className="text-foreground">Estrategia, sistema y código</span> en una sola mano. Dirijo producto junto a fundadores y equipos in-house, <span className="text-foreground">del primer workshop al último commit.</span>
          </p>
        </div>
      </div>
      <div data-fx className="fx-brands mt-20 grid grid-cols-2 border-l border-t md:grid-cols-4">
        {BRANDS.map((b, i) => (
          <div key={b.name} style={{ "--k": i } as React.CSSProperties} className="fx-brand group relative grid h-28 place-items-center border-b border-r md:h-36">
            <span className={`text-[22px] text-foreground opacity-40 transition duration-500 group-hover:opacity-100 md:text-[26px] ${b.cls}`}>{b.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
