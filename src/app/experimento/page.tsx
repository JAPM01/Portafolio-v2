import type { Metadata } from "next";
import ThemeGate from "../../components/ThemeGate";
import "../../components/experimento/melon-tokens.css";
import ExpHeader from "../../components/experimento/ExpHeader";
import ExpHero from "../../components/experimento/ExpHero";
import ExpManifesto from "../../components/experimento/ExpManifesto";
import ExpWork from "../../components/experimento/ExpWork";
import ExpExperience from "../../components/experimento/ExpExperience";
import ExpInsights from "../../components/experimento/ExpInsights";
import ExpClients from "../../components/experimento/ExpClients";
import ExpTestimonials from "../../components/experimento/ExpTestimonials";
import ExpClose from "../../components/experimento/ExpClose";

export const metadata: Metadata = {
  title: "melon studio — web, app & SaaS design studio in Poznań",
  description:
    "melon studio — UX/UI, web, app and SaaS design studio in Poznań, Poland",
};

// Versión experimento (19 Nov 2026, clon 1:1 TOTAL de Melon, pixel a pixel):
// Melon exacto en layout, distribución, jerarquía, estilo, tipografía gótica
// (Pirata One, sustituta abierta de Lekick), color (rojo #FD241A, crema
// #F6EFEF y oscuro #0F0000) Y TEXTOS (por indicación de Jafet, 17:57 CST:
// "tal cual... exactamente igual pixel a pixel"). Animaciones ligadas al
// scroll: deformación 3D de las tarjetas de trabajo y desenfoque del
// statement. Orden de Melon: Hero, Trabajo, Manifiesto (About),
// Experiencia, Insights, Clientes, Testimonios, Contacto y Footer.
// SIN sección Mi CV (Jafet, 18:24 CST: "Quitarlo para clon total" — Melon
// no tiene CV; el componente ExpCv.tsx se conserva sin renderizar para
// reponerlo cuando el clon se apruebe y el contenido pase a ser el suyo).
// Los detalles de Tom (footer y header), Moisez (preloader y líneas
// verticales) y Lucas Lima (mono) se implementan DESPUÉS de tener el clon
// exacto. La home principal queda solo con Hero + Intro.
export default function Experimento() {
  return (
    <>
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <ThemeGate />
      <ExpHeader />
      <main id="main">
        <ExpHero />
        <ExpWork />
        <ExpManifesto />
        <ExpExperience />
        <ExpInsights />
        <ExpClients />
        <ExpTestimonials />
        <ExpClose />
      </main>
    </>
  );
}
