import { useState } from "react";
import type { Project } from "./lib/projects";
import { Header } from "./components/portfolio/Header";
import { Hero } from "./components/portfolio/Hero";
import { Work } from "./components/portfolio/Work";
import { CaseStudy } from "./components/portfolio/CaseStudy";
import { Manifesto } from "./components/portfolio/Manifesto";
import { Experience } from "./components/portfolio/Experience";
import { Footer } from "./components/portfolio/Footer";
import { ContactSheet } from "./components/portfolio/ContactSheet";
import { SmoothScroll } from "./components/portfolio/SmoothScroll";
import { SkillMap } from "./components/portfolio/SkillMap";
import { Testimonials } from "./components/portfolio/Testimonials";
import { ScrollFX } from "./components/portfolio/ScrollFX";
import { Toaster } from "./components/ui/sonner";



export default function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [contact, setContact] = useState(false);
  const openContact = () => { setProject(null); setContact(true); };
  return (
    <div className="kit-dots min-h-screen overflow-x-clip bg-background">
      <a href="#work" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background">Saltar al trabajo</a>
      <SmoothScroll />
      <ScrollFX />
      <Header onContact={openContact} />
      <main>
        <Hero />
        <Work onOpen={setProject} />
        <Manifesto />
        <Experience />
        <SkillMap />
      </main>
      <div data-fx className="aurora-zone">
        <Testimonials onOpen={setProject} />
        <Footer onContact={openContact} />
      </div>
      <CaseStudy project={project} onClose={() => setProject(null)} onNavigate={setProject} onContact={openContact} />
      <ContactSheet open={contact} onOpenChange={setContact} />
      <Toaster theme="dark" position="bottom-center" />
    </div>
  );
}
