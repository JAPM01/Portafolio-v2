import { useInView } from "../../hooks/use-motion-prefs";

/**
 * Shared section header molecule. Every section uses the same 12-column editorial grid:
 * mono index label in columns 1–3, monumental title from column 4.
 */
export function SectionTitle({ num, label, title }: { num: string; label: string; title: string }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} data-fx className={`fx-title relative grid grid-cols-1 gap-y-5 pt-6 md:grid-cols-12 md:gap-x-6 ${inView ? "is-in" : ""}`}>
      <span className="fx-rule" aria-hidden />
      <span className="fx-label font-mono text-[11px] uppercase tracking-wider text-muted-foreground md:col-span-3 md:pt-3">{num} — {label}</span>
      <h2 className="fx-heading reveal-line text-[clamp(44px,7.4vw,120px)] font-medium leading-[0.88] tracking-[-0.055em] md:col-span-9"><span>{title}</span></h2>
    </div>
  );
}
