import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { CircleButton } from "./CircleButton";
import { PROJECTS, type Project } from "../../lib/projects";
import { SectionTitle } from "./SectionTitle";
import { useReducedMotion } from "../../hooks/use-motion-prefs";

export function Work({ onOpen }: { onOpen: (p: Project) => void }) {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();
  const total = PROJECTS.length;

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      let active = 0;
      wrapRefs.current.forEach((w, i) => {
        const card = cardRefs.current[i];
        const next = wrapRefs.current[i + 1];
        if (!w || !card) return;
        if (w.getBoundingClientRect().top <= vh * 0.5) active = i;
        let p = 0;
        if (next) {
          const top = next.getBoundingClientRect().top;
          p = Math.min(1, Math.max(0, 1 - (top - 96) / (vh - 96)));
        }
        card.style.transform = `scale(${1 - p * 0.05})`;
        card.style.filter = reduced ? "" : `blur(${p * 4}px) brightness(${1 - p * 0.35})`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [reduced, total]);

  return (
    <section id="work" className="relative px-5 pt-24 md:px-10 md:pt-32" aria-label="Trabajo seleccionado">
      <SectionTitle num="01" label="Proyectos" title="Trabajo seleccionado" />
      <div className="relative mt-12">
        <div className="work-lightfield" aria-hidden><span /><span /><span /></div>
        {PROJECTS.map((p, i) => (
          <div key={p.slug} ref={(el) => { wrapRefs.current[i] = el; }} data-fx className="fx-card sticky top-[88px] h-[min(calc(100svh-104px),760px)] min-h-[560px] py-2">
            <article
              ref={(el) => { cardRefs.current[i] = el; }}
              onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}
              className="glass-panel group grid h-full origin-top grid-cols-1 grid-rows-[1fr_auto] gap-6 overflow-hidden rounded-lg p-3 will-change-transform md:grid-cols-12 md:grid-rows-1 md:gap-6 md:p-4"
            >
              <button
                onClick={() => onOpen(p)}
                className="fx-media relative min-h-[200px] overflow-hidden rounded-[10px] text-left md:col-span-8"
                aria-label={`Abrir caso de estudio ${p.name}`}
              >
                <img src={p.image} alt={`${p.name} — vista previa del proyecto`} width={1600} height={1000} loading={i === 0 ? "eager" : "lazy"} className="fx-img absolute inset-0 h-[118%] w-full object-cover grayscale transition-[filter] duration-700 group-hover:grayscale-0" />
              </button>
              <div className="fx-info flex flex-col justify-between gap-6 px-2 pb-3 md:col-span-4 md:px-2 md:py-4">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="glass-pill inline-flex h-7 items-center rounded-full px-3 font-mono text-[11px] uppercase text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div>
                  <h3 className="text-[clamp(34px,4.2vw,64px)] font-medium leading-[0.9] tracking-[-0.05em]">{p.name}</h3>
                  <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground">{p.summary}</p>
                  <div className="mt-8 flex items-center gap-4">
                    <CircleButton label={`Abrir caso de estudio ${p.name}`} onClick={() => onOpen(p)}><ArrowUpRight /></CircleButton>
                    <span className="font-mono text-[11px] uppercase text-muted-foreground">Abrir caso</span>
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
