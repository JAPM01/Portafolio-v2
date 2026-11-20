import type { ReactNode } from "react";

/** Atom: the single circular control used across sections (cards, testimonials). */
export function CircleButton({ label, onClick, children, large }: { label: string; onClick: () => void; children: ReactNode; large?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={`grid shrink-0 place-items-center glass-pill rounded-full text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-ring ${large ? "h-14 w-14 [&_svg]:h-5 [&_svg]:w-5" : "h-12 w-12 [&_svg]:h-4 [&_svg]:w-4"}`} >
      {children}
    </button>
  );
}
