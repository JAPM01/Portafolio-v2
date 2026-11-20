"use client";
import { useState } from "react";
import LiquidChrome from "./LiquidChrome";

export default function Hero() {
  const [ptr, setPtr] = useState({ x: 0.66, y: 0.58 });
  return (
    <section id="top" className="px-3 pt-24 md:px-4 md:pt-28">
      <div
        className="relative h-[86vh] min-h-[560px] overflow-hidden rounded-[24px] border border-white/10 bg-[#010101]"
        style={{
          background:
            "radial-gradient(70% 60% at 75% 15%, rgba(0,10,255,0.55) 0%, rgba(0,10,255,0.12) 45%, transparent 70%), radial-gradient(60% 45% at 20% 100%, rgba(255,150,54,0.22) 0%, transparent 60%), linear-gradient(180deg, #0a0f2a 0%, #010101 65%)",
        }}
      >
        <LiquidChrome onPointer={(x, y) => setPtr({ x, y })} />
        {/* Fluted glass layer: vertical refraction ribs, stronger on the right */}
        <div className="fluted pointer-events-none absolute inset-y-0 right-0 w-[62%] opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" aria-hidden="true" />

        <div className="mono absolute right-4 top-4 z-10 text-right text-[10px] tracking-widest text-white/70 md:right-6 md:top-5">
          HB.SHADER · 60FPS · X {ptr.x.toFixed(2)} Y {ptr.y.toFixed(2)}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-10">
          <h1 className="-mx-1 text-[13.5vw] font-extrabold leading-[0.88] tracking-tighter text-[#fefefe] mix-blend-difference sm:text-[11vw] md:-mx-2 lg:text-[9.2vw]">
            SENIOR PRODUCT
            <br />
            DESIGNER <span className="font-light">&amp;</span>
            <br />
            BRAND ARCHITECT
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <p className="mono text-[12px] tracking-wider text-white/85 md:text-[13px]">
              hello@lorem.ipsum
            </p>
            <p className="mono max-w-[420px] text-right text-[10px] leading-relaxed tracking-widest text-white/55">
              LOREM IPSUM DOLOR SIT AMET —<br />
              CONSECTETUR ADIPISCING ELIT
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
