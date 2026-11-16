"use client";

import { useThemeGate } from "../lib/scroll";

/** Puerta de tema de la home (oscuro → claro → oscuro). En páginas de
    proyecto la base es clara. */
export default function ThemeGate({ base = "dark" }: { base?: "dark" | "light" }) {
  useThemeGate(base);
  return null;
}
