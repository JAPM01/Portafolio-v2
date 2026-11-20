"use client";
import { CLIENTS, LOREM } from "../lib/content";

const METRICS = [
  { value: "11+", label: "AÑOS INDEPENDIENTE" },
  { value: "50+", label: "MARCAS / VENTURES" },
  { value: "200k+", label: "USUARIOS" },
];

export default function Experience() {
  return (
    <section id="experience" className="px-4 py-20 md:px-6 md:py-28">
      <p className="mono mb-10 text-[11px] tracking-widest text-white/50">03 // EXPERIENCIA &amp; CLIENTES</p>
      <div className="grid grid-cols-1 gap-10 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-8">
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className="text-[64px] font-extrabold leading-none tracking-tighter md:text-[84px]">{m.value}</div>
              <div className="mono mt-2 text-[10px] tracking-widest text-[#888]">{m.label}</div>
            </div>
          ))}
        </div>
        <div>
          <p className="max-w-[560px] text-[18px] leading-relaxed text-white/75 md:text-[20px]">{LOREM}</p>
          <p className="mt-5 max-w-[560px] text-[18px] leading-relaxed text-white/75 md:text-[20px]">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {CLIENTS.map((c) => (
              <span
                key={c}
                className="text-[15px] font-bold tracking-tight text-white/40 transition-all hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
