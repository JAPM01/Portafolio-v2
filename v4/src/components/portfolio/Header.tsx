import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Magnetic } from "./Magnetic";

export function Header({ onContact }: { onContact: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const nav = [
    { href: "#work", label: "01 Proyectos" },
    { href: "#manifesto", label: "02 Manifiesto" },
    { href: "#experience", label: "03 Experiencia" },
    { href: "#stack", label: "04 Stack" },
    { href: "#testimonials", label: "05 Testimonios" },
  ];
  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b bg-background transition-colors ${scrolled ? "border-border" : "border-transparent"}`}>
      <div className="content-shell flex h-16 items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3" aria-label="Julia Prat, inicio">
          <span className="kit-chrome grid h-8 w-8 place-items-center rounded-sm font-display text-[14px] font-semibold tracking-tight text-background">JP</span>
          <span className="font-display text-[15px] font-semibold tracking-tight">Julia Prat</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="nav-link font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground">{n.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 font-mono text-xs uppercase text-status sm:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-status" />
            Available 2027
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
        <div className="mobile-menu border-t border-border bg-background px-5 pb-8 pt-4 lg:hidden">
          <nav aria-label="Móvil">
            {nav.map((n, i) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} style={{ "--k": i } as React.CSSProperties} className="mobile-nav-link display-text block border-b border-border py-4 text-4xl uppercase tracking-tighter last:border-0">{n.label}</a>
            ))}
          </nav>
          <button onClick={() => { setOpen(false); onContact(); }} style={{ "--k": nav.length } as React.CSSProperties} className="mobile-nav-link mt-6 w-full rounded-md bg-primary py-3 text-[15px] font-semibold text-primary-foreground">Contact</button>
        </div>
      )}
    </header>
  );
}
