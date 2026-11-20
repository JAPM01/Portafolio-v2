"use client";
import { ArrowUpRight } from "lucide-react";
import JPMonogram3D from "./JPMonogram3D";

const LINKS = [
  { label: "EMAIL", value: "hello@lorem.ipsum", href: "mailto:hello@lorem.ipsum" },
  { label: "LINKEDIN", value: "/in/loremipsum", href: "#contact" },
  { label: "GITHUB", value: "@lorem.ipsum", href: "#contact" },
  { label: "X", value: "@loremipsum", href: "#contact" },
  { label: "TELEGRAM", value: "@loremipsum", href: "#contact" },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-white/10">
      {/* Light atmosphere: amber core rising from the base, blue halo at the edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 100%, rgba(255,150,54,0.32) 0%, rgba(255,150,54,0.08) 45%, transparent 70%), radial-gradient(90% 60% at 0% 100%, rgba(0,10,255,0.28) 0%, transparent 55%), radial-gradient(90% 60% at 100% 100%, rgba(0,10,255,0.28) 0%, transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div className="mono relative flex flex-wrap justify-between gap-3 px-4 pt-10 text-[10px] tracking-widest text-white/50 md:px-6">
        <span>JAFET.PEREZ</span>
        <span>03 / 03</span>
        <span>PORTFOLIO 2027</span>
      </div>

      <div className="relative">
        <JPMonogram3D />
      </div>

      <div className="relative grid grid-cols-2 gap-8 px-4 pb-12 md:grid-cols-4 md:px-6">
        <div>
          <p className="mono text-[10px] tracking-widest text-white/50">PHONE</p>
          <p className="mono mt-2 text-[13px] text-white/85">+00 000 00 00 00</p>
          <p className="mono mt-6 text-[10px] tracking-widest text-white/50">EMAIL</p>
          <a href="mailto:hello@lorem.ipsum" className="mono mt-2 block text-[13px] text-white/85 hover:text-white">
            hello@lorem.ipsum
          </a>
        </div>
        <div className="md:col-span-2">
          <p className="mono text-[10px] tracking-widest text-white/50">LOREM IPSUM</p>
          <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-white/70">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        </div>
        <div className="text-right">
          {LINKS.slice(1).map((l) => (
            <a key={l.label} href={l.href} className="group mb-4 block">
              <span className="mono block text-[10px] tracking-widest text-white/50">{l.label}</span>
              <span className="mono mt-1 inline-flex items-center gap-1 text-[13px] text-white/85 group-hover:text-white">
                {l.value} <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Infinite marquee, cut exactly at the viewport edge */}
      <div className="relative overflow-hidden border-t border-white/10 pb-0">
        <div className="marquee-track flex w-max whitespace-nowrap py-2">
          {[0, 1].map((n) => (
            <span key={n} className="text-[18vw] font-extrabold leading-[0.85] tracking-tighter text-[#fefefe] md:text-[13vw]" aria-hidden={n === 1}>
              LET&apos;S BUILD SOMETHING ICONIC — PORTFOLIO 2027 —&nbsp;
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
