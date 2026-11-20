import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Magnetic } from "./Magnetic";

function fmt(tz: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz, hour12: false }).format(new Date());
}

export function Header({ onContact }: { onContact: () => void }) {
  const [t, setT] = useState<{ utc: string; bcn: string } | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tick = () => setT({ utc: fmt("UTC"), bcn: fmt("Europe/Madrid") });
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);
  const nav = [
    { href: "#work", label: "01 PROYECTOS" },
    { href: "#manifesto", label: "02 MANIFIESTO" },
    { href: "#experience", label: "03 EXPERIENCIA" },
    { href: "#stack", label: "04 STACK" },
    { href: "#testimonials", label: "05 TESTIMONIOS" },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-4">
      <div className="kit-bevel grid h-14 grid-cols-[auto_1fr_auto] items-center rounded-lg border-b border-foreground/10 font-mono text-[11px] backdrop-blur-md">
        <a href="#top" className="flex h-full items-center gap-3 border-r px-3 md:px-5" aria-label="Julia Prat, inicio">
          <span className="kit-chrome grid h-8 w-8 place-items-center rounded-sm font-display text-[14px] font-semibold tracking-tight text-background">JP</span>
          <span className="hidden font-display text-[14px] font-semibold tracking-tight sm:inline">Julia Prat</span>
        </a>
        <nav className="flex min-w-0 items-center gap-6 px-4 md:px-8" aria-label="Principal">
          <span className="hidden truncate uppercase text-muted-foreground 2xl:inline">PRODUCT • UX/UI • BRANDING</span>
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="hidden transition-colors text-muted-foreground hover:text-foreground lg:inline">{n.label}</a>
          ))}
          <span className="hidden text-muted-foreground 2xl:inline">41.3874°N 2.1686°E</span>
          <span className="ml-auto hidden text-muted-foreground md:inline" suppressHydrationWarning>UTC {t?.utc ?? "--:--"}</span>
          <span className="hidden md:inline" suppressHydrationWarning>BCN {t?.bcn ?? "--:--"}</span>
        </nav>
        <div className="flex h-full items-center gap-3 border-l pl-3 pr-2 md:gap-4 md:pl-5">
          <span className="flex items-center gap-2 text-status">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-status" />
            <span className="hidden sm:inline">AVAILABLE 2027</span><span className="sm:hidden">Q1 2027</span>
          </span>
          <Magnetic className="hidden sm:inline-block">
            <button onClick={onContact} className="rounded-md bg-primary px-5 py-2.5 font-display text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-ring">
              Contact
            </button>
          </Magnetic>
          <button className="grid h-10 w-10 place-items-center rounded-md border lg:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="kit-bevel mt-2 rounded-lg p-4 font-display lg:hidden">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="block border-b py-4 text-3xl font-medium uppercase tracking-tighter last:border-0">{n.label}</a>
          ))}
          <button onClick={() => { setOpen(false); onContact(); }} className="mt-4 w-full rounded-md bg-primary py-3 text-[15px] font-semibold text-primary-foreground">Contact</button>
        </div>
      )}
    </header>
  );
}
