/** Liquid glass (Apple Tahoe) — material del botón de jahed en 21st.dev,
    adaptado a CSS plano (el proyecto no usa Tailwind).
    El filtro SVG refracta el fondo (feDisplacementMap con un mapa radial:
    sin desplazamiento en el centro, máximo en el borde) y lo escarcha
    un poco; el CSS añade tinte, saturación y el brillo del borde.
    Chromium renderiza el filtro SVG dentro de backdrop-filter; Safari y
    Firefox no lo soportan y caen al blur escarchado del fallback. */
const MAP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%23808080'/%3E%3Cstop offset='70%25' stop-color='%23808080'/%3E%3Cstop offset='100%25' stop-color='%23ffffff'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3C/svg%3E";

export default function LiquidGlassFilter({ scale = 28 }: { scale?: number }) {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
      aria-hidden="true"
    >
      <defs>
        <filter
          id="liquid-glass-filter"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={MAP}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feGaussianBlur in="disp" stdDeviation="0.8" />
        </filter>
      </defs>
    </svg>
  );
}
