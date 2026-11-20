import { lazy, Suspense } from "react";
import { Copy } from "lucide-react";
import { CONTACT } from "../../lib/projects";
import { useGpuTier, useOnScreen, useReducedMotion } from "../../hooks/use-motion-prefs";
import { copyEmail } from "./copy-email";
import { Magnetic } from "./Magnetic";

const ChromeMonogram = lazy(() => import("../three/ChromeMonogram"));

function Fallback() {
  return <div className="kit-chrome mx-auto grid aspect-square w-48 rotate-45 place-items-center rounded-3xl" aria-hidden><span className="-rotate-45 text-6xl font-semibold tracking-tighter text-background">JP</span></div>;
}

export function Footer({ onContact }: { onContact: () => void }) {
  const tier = useGpuTier();
  const reduced = useReducedMotion();
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  const show3D = tier === "full" || tier === "lite";
  const phrase = "Let's build something iconic —";
  return (
    <footer id="contact" data-fx className="fx-footer relative overflow-hidden pt-20" aria-label="Contacto">
      <div className="relative grid grid-cols-1 items-center gap-10 px-5 md:grid-cols-[1fr_auto_1fr] md:px-10">
        <div className="space-y-4 font-mono text-[12px]">
          <button onClick={copyEmail} className="group flex items-center gap-2 font-display text-[22px] font-medium tracking-tight hover:text-muted-foreground md:text-[26px]">
            {CONTACT.email}<Copy size={16} className="opacity-50 group-hover:opacity-100" />
          </button>
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="block hover:text-muted-foreground">{CONTACT.phone}</a>
          <div className="text-muted-foreground">{CONTACT.coords}</div>
        </div>
        <div ref={ref} className="fx-monogram mx-auto h-[300px] w-[300px] cursor-grab active:cursor-grabbing md:h-[380px] md:w-[380px]">
          {show3D ? (
            
              <Suspense fallback={<Fallback />}><ChromeMonogram active={onScreen && !reduced} lite={tier === "lite"} /></Suspense>
            
          ) : <div className="grid h-full place-items-center"><Fallback /></div>}
        </div>
        <div className="space-y-4 font-mono text-[12px] md:text-right">
          <span className="inline-flex items-center gap-2 uppercase text-status"><span className="pulse-dot h-1.5 w-1.5 rounded-full bg-status" />Open Q1 2027</span>
          <div className="flex gap-4 md:justify-end">
            <a href="https://read.cv" target="_blank" rel="noreferrer" className="hover:text-muted-foreground">Read.cv</a>
            <span className="text-muted-foreground">·</span>
            <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="hover:text-muted-foreground">Dribbble</a>
          </div>
          <Magnetic><button onClick={onContact} className="rounded-md bg-primary px-6 py-3 font-display text-[14px] font-semibold text-primary-foreground hover:bg-foreground hover:text-background">Escríbeme</button></Magnetic>
          <div className="text-muted-foreground">© 2027 JP Studio</div>
        </div>
      </div>
      <div className="relative mt-16 overflow-hidden border-t border-foreground/10" aria-hidden>
        <div className="fx-marquee"><div className="kit-mq flex w-max whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k} className="pr-10 text-[clamp(80px,14vw,220px)] font-medium uppercase leading-[0.78] tracking-[-0.06em] translate-y-[14%]">{phrase} {phrase}</span>
          ))}
        </div></div>
      </div>
      <p className="sr-only">{phrase}</p>
    </footer>
  );
}
