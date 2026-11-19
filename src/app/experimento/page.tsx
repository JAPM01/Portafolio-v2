import type { Metadata } from "next";
import ThemeGate from "../../components/ThemeGate";
import "../../components/experimento/melon-tokens.css";
import ExpHeader from "../../components/experimento/ExpHeader";
import ExpHero from "../../components/experimento/ExpHero";
import ExpManifesto from "../../components/experimento/ExpManifesto";
import ExpWork from "../../components/experimento/ExpWork";
import ExpExperience from "../../components/experimento/ExpExperience";
import ExpClients from "../../components/experimento/ExpClients";
import ExpTestimonials from "../../components/experimento/ExpTestimonials";
import ExpCv from "../../components/experimento/ExpCv";
import ExpClose from "../../components/experimento/ExpClose";

export const metadata: Metadata = {
  title: "Jafet Pérez — Versión 2 experimento",
  description:
    "Versión experimento del portafolio: trabajo seleccionado, manifiesto, experiencia, clientes, testimonios, CV y contacto.",
};

// Versión experimento (19 Nov 2026, clon 1:1 TOTAL de Melon, medido en vivo):
// Melon exacto en layout, distribución, jerarquía, estilo, tipografía gótica
// (Pirata One, sustituta abierta de Lekick) y color (rojo #FD241A, crema
// #F6EFEF y oscuro #0F0000, con el contenido de Jafet). Los detalles de Tom
// (footer y header), Moisez (preloader y líneas verticales) y Lucas Lima
// (mono) se implementan DESPUÉS de tener el clon exacto. Orden: Hero,
// Trabajo seleccionado, Manifiesto, Experiencia, Clientes, Testimonios, Mi
// CV, Contacto y Footer. La home principal queda solo con Hero + Intro.
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
        <ExpClients />
        <ExpTestimonials />
        <ExpCv />
        <ExpClose />
      </main>
    </>
  );
}
