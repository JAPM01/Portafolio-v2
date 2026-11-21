import { useEffect, useRef } from "react";
import { PROJECTS, type Project } from "../../lib/projects";
import { SectionTitle } from "./SectionTitle";
import { useReducedMotion } from "../../hooks/use-motion-prefs";

/**
 * Galería: cards apiladas sticky, MEJORADA respecto al ZIP. Base del ZIP
 * (wrapper `sticky top-[88px]`; la siguiente card sube por encima de la
 * anterior) amplificada: la anterior se escala hasta 0.92, blur hasta 10px,
 * brightness hasta 0.25 y opacidad hasta 0.55, con easing smoothstep (no
 * lineal), para que su título no se lea detrás de la actual; la que entra
 * llega con un leve scale de 0.98→1. El parallax de ScrollFX sobre la
 * imagen es más marcado. La portada vive dentro del lente de vidrio
 * (como el Venn) sobre fx-media. La columna de info lleva SOLO título,
 * resumen y tags (sin métricas ni botón de abrir caso; el caso se abre
 * desde la imagen y el badge "Ver caso").
 */
export function Work({ onOpen }: { onOpen: (p: Project) => void }) {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();
  const total = PROJECTS.length;

  useEffect(() => {
    let raf = 0;
    const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      wrapRefs.current.forEach((w, i) => {
        const card = cardRefs.current[i];
        const next = wrapRefs.current[i + 1];
        if (!w || !card) return;
        // Entrada: 0 cuando la card asoma por abajo, 1 cuando queda fija (top 88px).
        const top = w.getBoundingClientRect().top;
        const e = smooth((vh - top) / (vh - 88));
        // Salida: 0 hasta que llega la siguiente, 1 cuando la cubre.
        let p = 0;
        if (next) {
          const nextTop = next.getBoundingClientRect().top;
          p = Math.min(1, Math.max(0, 1 - (nextTop - 96) / (vh - 96)));
        }
        const s = smooth(p);
        const scale = (1 - s * 0.08) * (0.98 + e * 0.02);
        card.style.transform = `scale(${scale})`;
        // La card cubierta se hunde en el fondo: mucho más blur, muy oscura y
        // semitransparente, para que su título no se lea detrás de la actual.
        card.style.filter = reduced ? "" : `blur(${s * 10}px) brightness(${1 - s * 0.75})`;
        card.style.opacity = reduced ? "" : String(1 - s * 0.45);
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
              className="glass-panel group grid h-full origin-top grid-cols-1 grid-rows-[1fr_auto] gap-6 overflow-hidden rounded-lg p-3 will-change-transform md:grid-cols-12 md:grid-rows-1 md:gap-6 md:p-4"
            >
              <button
                onClick={() => onOpen(p)}
                onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}
                className="fx-media relative min-h-[200px] overflow-hidden text-left md:col-span-8"
                aria-label={`Abrir caso de estudio ${p.name}`}
              >
                <img src={p.image} alt={`${p.name} — vista previa del proyecto`} width={1600} height={1000} loading={i === 0 ? "eager" : "lazy"} className="fx-img object-cover grayscale group-hover:grayscale-0" />
                <span className="fx-lens-tint" aria-hidden />
                <span className="fx-tag fx-tag-tl">{p.index} — {p.year}</span>
                <span className="fx-tag fx-tag-tr">{p.discipline}</span>
                <span className="fx-tag fx-tag-bl">{p.viewport}</span>
                <span className="fx-viewcase" aria-hidden>Ver caso ↗</span>
              </button>
              <div className="fx-info flex flex-col justify-between gap-6 px-2 pb-3 md:col-span-4 md:px-2 md:py-4">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="glass-pill inline-flex h-7 items-center rounded-full px-3 font-mono text-xs uppercase text-muted-foreground">{t}</span>
                  ))}
                </div>
                <div>
                  <h3 className="text-[clamp(34px,4.2vw,64px)] font-medium leading-[0.9] tracking-[-0.05em]">{p.name}</h3>
                  <p className="mt-5 max-w-[42ch] text-[17px] leading-relaxed text-muted-foreground">{p.summary}</p>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
