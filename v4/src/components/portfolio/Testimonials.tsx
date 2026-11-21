import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "../../lib/projects";
import { TESTIMONIALS, testimonialIndex } from "../../lib/portfolio-sections";
import { SectionTitle } from "./SectionTitle";
import { CircleButton } from "./CircleButton";

export function Testimonials({ onOpen }: { onOpen: (project: Project) => void }) {
  const [index, setIndex] = useState(0);
  const entry = TESTIMONIALS[index];
  if (!entry) return null;
  const project = PROJECTS.find(item => item.slug === entry.projectSlug);
  return (
    <section id="testimonials" className="content-shell relative py-20 md:py-28" aria-label="Testimonios">
      <SectionTitle num="05" label="Testimonios" title="What people say" />
      <div data-fx className="fx-rise mt-10 md:mt-14">
        <div className="testimonial-content" key={index} aria-live="polite" aria-atomic="true">
          <blockquote className="display-text m-0 max-w-[24ch] text-[clamp(32px,4.5vw,72px)] leading-[1.05] tracking-[-0.03em]">{entry.quote}</blockquote>
          <div className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[17px]">
            <span className="font-semibold">{entry.author}</span>
            <span className="text-muted-foreground">{entry.role}</span>
          </div>
          {project && <button type="button" className="mt-3 inline-flex items-center gap-2 text-[17px] underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground" onClick={() => onOpen(project)}>
            {project.name} case study <ArrowUpRight size={15} />
          </button>}
        </div>
        <div className="mt-10 flex items-center gap-5">
          <CircleButton large label="Testimonio anterior" onClick={() => setIndex(testimonialIndex(index, -1))}><ArrowLeft /></CircleButton>
          <span className="w-14 text-center font-mono text-xs tabular-nums text-foreground/70">{String(index + 1).padStart(2, "0")} / {String(TESTIMONIALS.length).padStart(2, "0")}</span>
          <CircleButton large label="Siguiente testimonio" onClick={() => setIndex(testimonialIndex(index, 1))}><ArrowRight /></CircleButton>
        </div>
      </div>
    </section>
  );
}
