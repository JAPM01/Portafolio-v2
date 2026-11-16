"use client";

import { useEffect, useRef } from "react";
import {
  FLUTE_SIZE_TO,
  HERO_PLATE_ASPECT,
  flutePeriod,
  isPhone,
} from "../lib/flute";
import styles from "./panel-lines.module.css";

/** Líneas verticales de rejilla de las páginas de proyecto.
    Ref: <div class="PanelLines-module__field Hero-module__panelLines">
    como primer hijo de <main>, con --flute-tile/--flute-offset/--flute-line
    medidos por el hook de la referencia (fórmula de viewport, estática). */
export default function PanelLines() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      const s = flutePeriod(w * dpr, h * dpr, w, 0, FLUTE_SIZE_TO, HERO_PLATE_ASPECT);
      if (!s || !(s.period > 1)) {
        el.style.setProperty("--flute-line", "0px");
        return;
      }
      const tile = s.period * (isPhone() ? 1 : 2);
      const offset = ((s.anchor - 0.5) % tile + tile) % tile;
      el.style.setProperty("--flute-tile", `${tile.toFixed(3)}px`);
      el.style.setProperty("--flute-offset", `${offset.toFixed(3)}px`);
      el.style.setProperty("--flute-line", "1.00px");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      className={`${styles.field} ${styles.panelLines}`}
      aria-hidden="true"
      ref={ref}
    />
  );
}
