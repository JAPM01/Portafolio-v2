"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Magnetic from "./Magnetic";

function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const utc = d.toISOString().slice(11, 19);
      const local = d.toLocaleTimeString("es-MX", { hour12: false, timeZone: "America/Mexico_City" });
      setNow(`UTC ${utc} · PCH ${local}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Header() {
  const clock = useClock();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 md:px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#fefefe] text-black">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="JP monogram">
              <path d="M7 28 V4 H15 a6 6 0 0 1 0 12 H7" />
              <path d="M25 4 V20 a5 5 0 0 1 -10 0" />
            </svg>
          </span>
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">Jafet Pérez</span>
          <span className="mono hidden text-[10px] tracking-widest text-white/50 lg:inline">
            20.1210° N, 98.7330° W
          </span>
        </a>
        <nav className="mono hidden items-center gap-6 text-[11px] tracking-widest text-white/70 md:flex">
          <a href="#work" className="hover:text-white">01 WORK</a>
          <a href="#manifesto" className="hover:text-white">02 MANIFESTO</a>
          <a href="#experience" className="hover:text-white">03 EXPERIENCE</a>
        </nav>
        <div className="flex items-center justify-end gap-3">
          <span className="mono hidden text-[10px] tracking-widest text-white/50 xl:inline">{clock}</span>
          <span className="mono hidden items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[10px] tracking-widest sm:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#ff9636]" />
            AVAILABLE 2027
          </span>
          <Magnetic>
            <a
              href="#contact"
              className="group flex items-center gap-1 rounded-full bg-[#000aff] px-4 py-2 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Contact
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Magnetic>
        </div>
      </div>
      <div className="mono hidden justify-between px-6 pb-1.5 text-[9px] tracking-widest text-white/35 md:flex">
        <span>PRODUCT • UX/UI • BRANDING</span>
        <span>PORTFOLIO 2027</span>
      </div>
    </header>
  );
}
