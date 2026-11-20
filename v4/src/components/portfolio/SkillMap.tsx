import { lazy, Suspense, useState } from "react";
import { Button } from "../ui/button";
import { SKILLS, radarPoint } from "../../lib/portfolio-sections";
import { useGpuTier, useInView, useOnScreen, useReducedMotion } from "../../hooks/use-motion-prefs";
import { SectionTitle } from "./SectionTitle";

const SkillGlass = lazy(() => import("../three/SkillGlass"));

const polygon = (values: readonly number[]) => values.map((value, i) => {
  const point = radarPoint(i, value);
  return `${point.x},${point.y}`;
}).join(" ");

export function SkillMap() {
  const [active, setActive] = useState<number | null>(null);
  const [ref, visible] = useInView<HTMLDivElement>(0.25);
  const [glRef, onScreen] = useOnScreen<HTMLDivElement>();
  const tier = useGpuTier();
  const reduced = useReducedMotion();
  const show3D = tier === "full" || tier === "lite";
  return (
    <section id="stack" className="px-5 py-24 md:px-10 md:py-32" aria-label="Stack y capacidades">
      <SectionTitle num="04" label="Stack" title="Skill map" />
      <div ref={ref} data-fx className={`fx-zoom skill-map ${visible ? "skill-map-visible" : ""} ${show3D ? "skill-map-3d" : ""}`} onMouseLeave={() => setActive(null)}>
        {show3D && <div ref={glRef} className="skill-glass" aria-hidden>
          
            <Suspense fallback={null}><SkillGlass active={active} visible={visible} running={onScreen && !reduced} lite={tier === "lite"} /></Suspense>
          
        </div>}
        <svg viewBox="0 0 1200 800" className="skill-radar" fill="none" role="group" aria-label="Radar de seis capacidades">
          <g className="radar-flat">
            <g className="radar-grid">
              {[100, 75, 50, 25].map(value => <polygon key={value} points={polygon(SKILLS.map(() => value))} />)}
              {SKILLS.map((skill, i) => { const p = radarPoint(i, 112); return <line key={skill.axis} x1="600" y1="400" x2={p.x} y2={p.y} />; })}
            </g>
            <polygon className="radar-shape" points={polygon(SKILLS.map(skill => skill.value))} />
          </g>
          {SKILLS.map((skill, i) => {
            const p = radarPoint(i, skill.value);
            return <g key={skill.axis} className={`radar-node ${active === i ? "radar-node-active" : ""}`}>
              <circle cx={p.x} cy={p.y} r="8" className="radar-dot radar-flat" />
              <foreignObject x={p.x - 24} y={p.y - 24} width="48" height="48">
                <button type="button" className="h-12 w-12 rounded-full focus-visible:outline-2 focus-visible:outline-ring" aria-label={`Explorar ${skill.label}`} title={skill.label} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} />
              </foreignObject>
            </g>;
          })}
        </svg>
        {SKILLS.map((skill, i) => <Button
          key={skill.axis} variant="ghost"
          className={`skill-label skill-${skill.axis} ${active === i ? "skill-label-active" : ""}`}
          onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
          onClick={() => setActive(i)} aria-pressed={active === i}
          aria-label={`${skill.label}, ${skill.value}, ${skill.tools}`}
        >
          <span className="skill-value">{skill.value}</span>
          <span className="skill-name">{skill.label}</span>
          <span className="skill-tools" aria-hidden={active !== i}>{active === i ? skill.tools : "\u00a0"}</span>
        </Button>)}
      </div>
    </section>
  );
}
