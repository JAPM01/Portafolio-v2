"use client";

import type { ImgHTMLAttributes } from "react";
import styles from "./brand-media.module.css";

/**
 * Los SVG externos cargados mediante <img> no heredan custom properties
 * del documento. Los placeholders se pintan INLINE con los mismos
 * tokens semánticos que la interfaz, incluidos ambos temas.
 * Las imágenes reales permanecen intactas.
 */
export function isBrandPlaceholder(src?: string) {
  return Boolean(src?.split(/[?#]/, 1)[0].endsWith("/placeholder.svg"));
}

type Props = ImgHTMLAttributes<HTMLImageElement>;

/* eslint-disable @next/next/no-img-element */
export default function BrandMedia({ src, alt = "", className = "", width, height, ...props }: Props) {
  if (!isBrandPlaceholder(src)) {
    return <img src={src} alt={alt} className={className} width={width} height={height} {...props} />;
  }

  const hidden = props["aria-hidden"] === true || props["aria-hidden"] === "true";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={`${styles.placeholder} ${className}`}
      width={width}
      height={height}
      role={hidden ? undefined : "img"}
      aria-hidden={hidden}
      aria-label={hidden ? undefined : alt || "Placeholder"}
      focusable="false"
    >
      <rect width="800" height="600" className={styles.surface} />
      <rect x="24" y="24" width="752" height="552" className={styles.outline} />
      <text x="400" y="310" textAnchor="middle" className={styles.caption}>Placeholder</text>
    </svg>
  );
}
