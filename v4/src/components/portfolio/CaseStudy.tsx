import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "../ui/sheet";
import { PROJECTS, type Project } from "../../lib/projects";

const CROPS = ["50% 50%", "15% 30%", "85% 70%"];

export function CaseStudy({ project, onClose, onNavigate, onContact }: { project: Project | null; onClose: () => void; onNavigate: (p: Project) => void; onContact: () => void }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => setFrame(0), [project?.slug]);
  const idx = project ? PROJECTS.findIndex((p) => p.slug === project.slug) : -1;
  const next = idx >= 0 ? PROJECTS[(idx + 1) % PROJECTS.length] : undefined;

  return (
    <Sheet open={!!project} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full max-w-none overflow-y-auto border-l bg-background p-0 sm:max-w-none md:w-[min(1100px,92vw)] [&>button]:hidden" data-lenis-prevent>
        {project && (
          <div className="pb-16">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-5 py-3 font-mono text-xs backdrop-blur-md md:px-10">
              <span className="text-muted-foreground">CASO {project.index} / {String(PROJECTS.length).padStart(2, "0")} · {project.discipline.toUpperCase()}</span>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md border hover:bg-surface-2" aria-label="Cerrar caso de estudio"><X size={16} /></button>
            </div>
            <div className="px-5 pt-10 md:px-10">
              <span className="flex items-center gap-2 font-mono text-xs text-status"><span className="h-1.5 w-1.5 rounded-full bg-status" />{project.status} · {project.role}</span>
              <SheetTitle className="mt-4 text-[clamp(48px,8vw,112px)] font-medium uppercase leading-[0.85] tracking-[-0.06em]">{project.name}</SheetTitle>
              <SheetDescription className="mt-5 max-w-2xl text-[20px] leading-snug tracking-tight text-foreground md:text-[24px]">{project.headline}</SheetDescription>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((t) => <span key={t} className="inline-flex h-7 items-center rounded-full border px-3 font-mono text-xs uppercase text-muted-foreground">{t}</span>)}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-px border-y bg-border md:grid-cols-4">
              {project.metrics.concat([{ value: project.year, label: "AÑO" }, { value: String(project.process.length).padStart(2, "0"), label: "FASES" }]).map((m) => (
                <div key={m.label} className="bg-background px-5 py-6 md:px-10">
                  <div className="text-[44px] font-medium tracking-[-0.04em]">{m.value}</div>
                  <div className="font-mono text-xs text-muted-foreground">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-10 px-5 py-14 md:grid-cols-2 md:px-10">
              <div>
                <h3 className="font-mono text-xs text-highlight">// DESAFÍO</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{project.challenge}</p>
              </div>
              <div>
                <h3 className="font-mono text-xs text-highlight">// SOLUCIÓN</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-foreground">{project.solution}</p>
              </div>
            </div>

            <div className="px-5 md:px-10">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-muted-foreground">PROTOTYPE · FRAME {String(frame + 1).padStart(2, "0")}/{String(project.frames.length).padStart(2, "0")}</span>
                <div className="flex gap-2">
                  <button aria-label="Pantalla anterior" disabled={frame === 0} onClick={() => setFrame((f) => f - 1)} className="grid h-9 w-9 place-items-center rounded-md border disabled:opacity-30 hover:bg-surface-2"><ArrowLeft size={15} /></button>
                  <button aria-label="Pantalla siguiente" disabled={frame === project.frames.length - 1} onClick={() => setFrame((f) => f + 1)} className="grid h-9 w-9 place-items-center rounded-md border disabled:opacity-30 hover:bg-surface-2"><ArrowRight size={15} /></button>
                </div>
              </div>
              <div
                className="kit-bevel relative mt-4 aspect-[16/10] overflow-hidden rounded-lg"
                tabIndex={0}
                aria-label="Prototipo interactivo: usa las flechas para cambiar de pantalla"
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") setFrame((f) => Math.min(project.frames.length - 1, f + 1));
                  if (e.key === "ArrowLeft") setFrame((f) => Math.max(0, f - 1));
                }}
              >
                {project.frames.map((f, i) => (
                  <img key={f.title} src={project.image} alt={`${project.name}: ${f.title}`} className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                    style={{ objectPosition: CROPS[i % CROPS.length], opacity: i === frame ? 1 : 0, transform: i === frame ? "scale(1)" : "scale(1.08)" }} loading="lazy" />
                ))}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-5 pt-16">
                  <div className="text-[22px] font-medium tracking-tight">{project.frames[frame]?.title}</div>
                  <div className="text-[14px] text-muted-foreground">{project.frames[frame]?.caption}</div>
                </div>
                <div className="absolute left-3 top-3 flex gap-1">
                  {project.frames.map((_, i) => (
                    <button key={i} onClick={() => setFrame(i)} aria-label={`Ir a pantalla ${i + 1}`} className={`h-1 w-8 rounded-full ${i === frame ? "bg-foreground" : "bg-foreground/25"}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-14 grid gap-px bg-border px-0 md:grid-cols-4">
              {project.process.map((s) => (
                <div key={s.step} className="bg-background px-5 py-6 md:px-6">
                  <div className="font-mono text-xs text-muted-foreground">{s.step}</div>
                  <div className="mt-2 text-[20px] font-medium tracking-tight">{s.title}</div>
                  <p className="mt-2 text-[14px] text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 px-5 md:px-10">
              <button onClick={onContact} className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-[14px] font-semibold text-primary-foreground hover:bg-foreground hover:text-background">Hablemos de tu proyecto</button>
              {next && (
                <button onClick={() => onNavigate(next)} className="group text-right">
                  <div className="font-mono text-xs text-muted-foreground">SIGUIENTE CASO</div>
                  <div className="text-[28px] font-semibold uppercase tracking-[-0.03em] group-hover:text-muted-foreground">{next.name} →</div>
                </button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
