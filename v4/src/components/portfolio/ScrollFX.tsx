import { useEffect } from "react";
import { useReducedMotion } from "../../hooks/use-motion-prefs";

/**
 * Single scroll-motion driver. Every element with [data-fx] receives
 *  --p  : 0 → 1 while it travels through the viewport (parallax)
 *  --pe : 0 → 1 while it enters (reveals). CSS composes the choreography.
 */
export function ScrollFX() {
  const reduced = useReducedMotion();
  useEffect(() => {
    let els = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]"));
    if (reduced) {
      els.forEach(el => { el.style.setProperty("--p", "0.5"); el.style.setProperty("--pe", "1"); });
      return;
    }
    const mo = new MutationObserver(() => { els = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]")); });
    mo.observe(document.body, { childList: true, subtree: true });
    const last = new WeakMap<HTMLElement, [number, number]>();
    let raf = 0;
    const loop = () => {
      const vh = window.innerHeight;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        const pe = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
        const prev = last.get(el);
        if (!prev || Math.abs(prev[0] - p) > 0.0005 || Math.abs(prev[1] - pe) > 0.0005) {
          el.style.setProperty("--p", p.toFixed(4));
          el.style.setProperty("--pe", pe.toFixed(4));
          last.set(el, [p, pe]);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); mo.disconnect(); };
  }, [reduced]);
  return null;
}

/** Splits copy into words for scroll-scrubbed reveals; keeps the sentence readable to screen readers. */
export function ScrollWords({ parts }: { parts: { text: string; tone?: "muted" }[] }) {
  const words = parts.flatMap(part => part.text.split(/(\s+)/).filter(Boolean).map(w => ({ w, tone: part.tone })));
  const n = words.filter(x => x.w.trim()).length;
  let i = 0;
  return (
    <>
      <span className="sr-only">{parts.map(p => p.text).join("")}</span>
      <span aria-hidden>
        {words.map((x, k) => x.w.trim()
          ? <span key={k} className={`fx-word ${x.tone === "muted" ? "text-muted-foreground" : "text-foreground"}`} style={{ "--i": i++, "--n": n } as React.CSSProperties}>{x.w}</span>
          : x.w)}
      </span>
    </>
  );
}
