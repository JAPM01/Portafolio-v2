import { ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "../../lib/projects";
import { Magnetic } from "./Magnetic";
import { SectionTitle } from "./SectionTitle";

export function Work({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <section id="work" className="content-shell relative py-20 md:py-28" aria-label="Trabajo seleccionado">
      <SectionTitle num="01" label="Proyectos" title="Trabajo seleccionado" />
      <div className="relative mt-10">
        {PROJECTS.map((p, i) => {
          const odd = i % 2 === 1;
          return (
          <div key={p.slug} data-fx className="fx-card py-3">
            <article
              className="work-card group grid grid-cols-1 grid-rows-[1fr_auto] gap-6 rounded-lg p-3 md:h-[600px] md:grid-cols-12 md:grid-rows-1 md:gap-6 md:p-4"
            >
              <button
                onClick={() => onOpen(p)}
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                  e.currentTarget.style.setProperty("--tx", `${((e.clientX - r.left) / r.width) * 2 - 1}`);
                  e.currentTarget.style.setProperty("--ty", `${((e.clientY - r.top) / r.height) * 2 - 1}`);
                }}
                className={`fx-media relative min-h-[200px] overflow-hidden text-left md:col-span-8 ${odd ? "md:order-2" : ""}`}
                aria-label={`Ver proyecto ${p.name}`}
              >
                <img src={p.image} alt={`${p.name} — vista previa del proyecto`} width={1600} height={1000} loading={i === 0 ? "eager" : "lazy"} className="fx-img object-cover grayscale group-hover:grayscale-0" />
                <span className="fx-lens-tint" aria-hidden />
                <span className="fx-tag fx-tag-tl">{p.index} — {p.year}</span>
                <span className="fx-tag fx-tag-tr">{p.discipline}</span>
                <span className="fx-tag fx-tag-bl">{p.viewport}</span>
                <span className="fx-viewcase" aria-hidden>Ver caso ↗</span>
              </button>
              <div className={`fx-info flex flex-col justify-center gap-6 px-2 pb-3 md:col-span-4 md:px-2 md:py-4 ${odd ? "md:order-1" : ""}`}>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="glass-pill inline-flex h-7 items-center rounded-full px-3 font-mono text-xs uppercase text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div>
                  <h3 className="text-[clamp(34px,4.2vw,64px)] font-medium leading-[0.9] tracking-[-0.05em]">{p.name}</h3>
                  <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-muted-foreground">{p.summary}</p>
                  <div className="mt-8 flex gap-8">
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <p className="work-metric-value">{m.value}</p>
                        <p className="work-metric-label mt-2">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Magnetic>
                      <button
                        onClick={() => onOpen(p)}
                        aria-label={`Abrir caso de estudio ${p.name}`}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/25 px-5 font-mono text-xs uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                      >
                        Abrir caso <ArrowUpRight size={14} />
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </article>
          </div>
          );
        })}
      </div>
    </section>
  );
}
