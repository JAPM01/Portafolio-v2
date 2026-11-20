"use client";
import Venn3D from "./Venn3D";

export default function Manifesto() {
  return (
    <section id="manifesto" className="relative px-4 pb-10 pt-20 md:px-6 md:pt-28">
      <div className="dotgrid pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />
      <div className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <p className="mono mb-6 text-[11px] tracking-widest text-white/50">02 // MANIFIESTO</p>
          <p className="max-w-[720px] text-[26px] font-medium leading-[1.25] tracking-tight text-white/60 md:text-[36px]">
            Lorem ipsum dolor sit amet,{" "}
            <span className="font-bold text-white">consectetur adipiscing elit, sed do eiusmod.</span>{" "}
            Tempor incididunt ut labore et dolore magna aliqua,{" "}
            <span className="font-bold text-white">ut enim ad minim veniam, quis nostrud exercitation.</span>{" "}
            Ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-[#121212]">
          <Venn3D />
        </div>
      </div>
      <div className="mono relative mt-10 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4 text-[10px] tracking-widest text-white/45">
        <span>JAFET.PEREZ</span>
        <span>03 / 03</span>
        <span>PORTFOLIO 2027</span>
      </div>
    </section>
  );
}
