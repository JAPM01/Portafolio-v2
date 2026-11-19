import SiteNav from "../components/SiteNav";
import Hero from "../components/Hero";
import HeroLoader from "../components/HeroLoader";
import Intro from "../components/Intro";
import ThemeGate from "../components/ThemeGate";

// Home experimental (19 Nov 2026): solo Hero + Intro (manifiesto).
// Las demás secciones (Capabilities, Work, ProcessSummary, MarkShowcase,
// Terms, Faq, Why, ContactClose) se retiraron de la vista; sus archivos
// están en src/components/_backup-placeholder/ y nada las importa.
export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <ThemeGate />
      <HeroLoader />
      <SiteNav />
      <main id="main">
        <Hero />
        <Intro />
      </main>
    </>
  );
}
