import SiteNav from "../components/SiteNav";
import Hero from "../components/Hero";
import HeroLoader from "../components/HeroLoader";
import Intro from "../components/Intro";
import Capabilities from "../components/Capabilities";
import Work from "../components/Work";
import ProcessSummary from "../components/ProcessSummary";
import MarkShowcase from "../components/MarkShowcase";
import Terms from "../components/Terms";
import Faq from "../components/Faq";
import Why from "../components/Why";
import ContactClose from "../components/ContactClose";
import ThemeGate from "../components/ThemeGate";

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
        <Capabilities />
        <Work />
        <ProcessSummary />
        <MarkShowcase />
        <Terms />
        <Faq />
        <Why />
        <ContactClose />
      </main>
    </>
  );
}
