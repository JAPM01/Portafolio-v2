import { ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "../../lib/projects";
import { SectionTitle } from "./SectionTitle";

export function Work({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <section id="work" className="relative px-5 py-20 md:px-10 md:py-28" aria-label="Trabajo seleccionado">
      <SectionTitle num="01" label="Proyectos" title="Trabajo seleccionado" />
      <div className="relative mt-10">
        <div className="work-lightfield" aria-hidden><span /><span /><span /></div>
        {PROJECTS.map((p, i) => (
          <div key={p.slug} data-fx className="fx-card py-3">
            <article
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}
              className="glass-panel group grid grid-cols-1 grid-rows-[1fr_auto] gap-6 overflow-hidden rounded-lg p-3 md:h-[600px] md:grid-cols-12 md:grid-rows-1 md:gap-6 md:p-4"
            >
              <button
                onClick={() => onOpen(p)}
                className="fx-media relative min-h-[200px] overflow-hidden rounded-[10px] text-left md:col-span-8"
                aria-label={`Ver proyecto ${p.name}`}
              >
                <img src={p.image} alt={`${p.name} — vista previa del proyecto`} width={1600} height={1000} loading={i === 0 ? "eager" : "lazy"} className="fx-img absolute inset-0 h-full w-full object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0" />
              </button>
              <div className="fx-info flex flex-col justify-center gap-6 px-2 pb-3 md:col-span-4 md:px-2 md:py-4">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="glass-pill inline-flex h-7 items-center rounded-full px-3 font-mono text-[11px] uppercase text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div>
                  <h3 className="text-[clamp(34px,4.2vw,64px)] font-medium leading-[0.9] tracking-[-0.05em]">{p.name}</h3>
                  <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground">{p.summary}</p>
                  <div className="mt-8">
                    <button
                      onClick={() => onOpen(p)}
                      aria-label={`Abrir caso de estudio ${p.name}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/25 px-5 font-mono text-[11px] uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                      Abrir caso <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
