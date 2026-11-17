/** Visible SVG displacement of the live backdrop in supported Chromium.
 * Renders no pixels by itself. The glass surface remains liquid-glass-react.
 *
 * Filter Effects backdrops are not interoperable across all browsers, so the
 * header CSS supplies a frosted fallback when this URL filter is unavailable.
 */
export default function JpmGlassOptics() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter
          id="jpm-glass-optics"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.028"
            numOctaves="2"
            seed="12"
            stitchTiles="stitch"
            result="flow"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="flow"
            scale="24"
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />
          <feOffset in="refracted" dx="0.8" dy="0" result="red-shifted" />
          <feColorMatrix
            in="red-shifted"
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="red"
          />
          <feColorMatrix
            in="refracted"
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="green"
          />
          <feOffset in="refracted" dx="-0.8" dy="0" result="blue-shifted" />
          <feColorMatrix
            in="blue-shifted"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="blue"
          />
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" />
        </filter>
      </defs>
    </svg>
  );
}
