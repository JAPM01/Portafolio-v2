"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { WORK } from "../lib/content";
import Magnetic from "./Magnetic";

gsap.registerPlugin(ScrollTrigger);

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ART = [
  `${BASE}/work/chrome-blue.jpg`,
  `${BASE}/work/chrome-amber.jpg`,
  `${BASE}/work/chrome-silver.jpg`,
  `${BASE}/work/glass-spheres.jpg`,
  `${BASE}/work/chrome-blue.jpg`,
  `${BASE}/work/chrome-amber.jpg`,
  `${BASE}/work/chrome-silver.jpg`,
  `${BASE}/work/glass-spheres.jpg`,
  `${BASE}/work/chrome-blue.jpg`,
  `${BASE}/work/chrome-amber.jpg`,
];

export default function Work() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.95,
          filter: "blur(4px)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="work" className="px-3 pt-20 md:px-4 md:pt-28">
      <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5">
        <h2 className="flex items-baseline gap-4">
          <span className="text-[52px] font-bold leading-none tracking-tighter md:text-[72px]">01</span>
          <span className="text-[15px] font-semibold tracking-tight md:text-[18px]">TRABAJO SELECCIONADO</span>
        </h2>
        <span className="mono hidden text-[10px] tracking-widest text-white/50 md:inline">
          STACK 03 / 10 · CURTAIN 62%
        </span>
      </div>

      <div ref={rootRef} className="relative">
        {WORK.map((w, i) => (
          <article
            key={w.index}
            data-cursor="view"
            className="work-card sticky top-0 mb-6 min-h-[640px] overflow-hidden rounded-[20px] border border-white/10 bg-[#0a0a0a]"
            style={{ height: "100vh" }}
          >
            <div className="grid h-full grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col justify-between p-6 pt-24 md:p-9 md:pt-28">
                <div className="mono flex items-center justify-between text-[10px] tracking-widest text-white/55">
                  <span>{w.total}</span>
                  <span className="flex items-center gap-2 text-white/70">
                    <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#ff9636]" />
                    LIVE {w.year}
                  </span>
                </div>
                <div>
                  <div className="text-[96px] font-extrabold leading-none tracking-tighter text-[#fefefe] md:text-[128px]">
                    {w.index}
                  </div>
                  <h3 className="mt-4 text-[26px] font-bold tracking-tight md:text-[32px]">{w.title}</h3>
                  <p className="mt-2 max-w-[380px] text-[14px] leading-relaxed text-white/60">{w.desc}</p>
                  <p className="mono mt-3 text-[11px] tracking-wider text-white/45">{w.metric}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {w.tags.map((t) => (
                      <span key={t} className="mono rounded-full border border-white/15 px-3 py-1 text-[10px] tracking-widest text-white/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative hidden overflow-hidden bg-[#121212] md:block">
                <img
                  src={ART[i % ART.length]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
                <div className="dotgrid absolute inset-0 opacity-20" aria-hidden="true" />
                <div className="absolute left-1/2 top-1/2 h-[62%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-white/20 bg-white/[0.04] shadow-2xl backdrop-blur-sm">
                  <div className="mono absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[9px] tracking-widest text-white/80">
                    PROTOTYPE · {w.frame}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[15px] font-semibold leading-snug">{w.title}</p>
                    <p className="mono mt-1 text-[10px] tracking-widest text-white/55">LOREM IPSUM — {w.year}</p>
                  </div>
                </div>
                <div className="absolute bottom-5 right-5">
                  <Magnetic>
                    <a
                      href="#work"
                      className="flex items-center gap-1 rounded-full bg-[#000aff] px-4 py-2.5 text-[13px] font-semibold text-white"
                    >
                      Abrir caso <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Magnetic>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mono flex justify-between pb-2 text-[10px] tracking-widest text-white/40">
        <span>07 MÁS</span>
        <span>SCROLL — CURTAIN</span>
      </div>
    </section>
  );
}
