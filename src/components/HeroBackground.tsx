"use client";

// Fondo del hero: fluted glass de aidesigner.ai (runtime por CDN), con la
// paleta exacta de Jafet. Reemplaza el MeshGradient + FlutedGlass de
// paper-design (que Jafet rechazó en su teléfono: rayas diagonales y banda
// negra). El runtime lee los data-aifx del div y pinta el efecto.
//
// Nota: el snippet de Jafet usaba clases de Tailwind (absolute inset-0
// -z-10...), pero este proyecto no tiene Tailwind (CSS modules), así que
// van como estilos inline con el mismo resultado. El wrapper con
// isolation: isolate crea el stacking context para que el -z-10 del div
// quede dentro del hero (el Hero no se toca).
export default function HeroBackground() {
  return (
    <div
      style={{ position: "absolute", inset: 0, isolation: "isolate" }}
      aria-hidden="true"
    >
      <div
        data-aifx="fluted-glass"
        data-aifx-colors="#000000,#1100ff,#000000,#fe0149,#00d0f0"
        data-aifx-bg="#1100ff"
        data-aifx-grain="0.25"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -10,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
