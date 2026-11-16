"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./font-picker.module.css";

/** Selector flotante de tipografía (vista previa temporal).
    Cambia --font-body en vivo para todo el sitio y guarda la elección en
    localStorage, así sobrevive al navegar y recargar. Cuando Jafet elija
    una definitiva, se fija en globals.css y este componente se retira. */

const DEFAULT_FONT = "Manrope";
const STORAGE_KEY = "portafolio-font-preview";
const FALLBACKS =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Lista curada para hojear; el buscador acepta cualquier familia de Google Fonts.
const CURATED: { label: string; fonts: string[] }[] = [
  {
    label: "Sans · grotescas",
    fonts: [
      "Inter",
      "Manrope",
      "Space Grotesk",
      "Sora",
      "Outfit",
      "Plus Jakarta Sans",
      "DM Sans",
      "Archivo",
      "Work Sans",
      "Hanken Grotesk",
      "Instrument Sans",
      "Public Sans",
      "Figtree",
      "Onest",
      "Geist",
      "IBM Plex Sans",
      "Roboto Flex",
      "Noto Sans",
    ],
  },
  {
    label: "Display · expresivas",
    fonts: [
      "Syne",
      "Unbounded",
      "Bricolage Grotesque",
      "Anton",
      "Archivo Black",
      "Gloock",
      "Instrument Serif",
      "Fraunces",
    ],
  },
  {
    label: "Serif",
    fonts: [
      "Fraunces",
      "Playfair Display",
      "Instrument Serif",
      "Gloock",
      "Lora",
      "Merriweather",
      "Newsreader",
      "Source Serif 4",
      "IBM Plex Serif",
    ],
  },
  {
    label: "Mono",
    fonts: ["JetBrains Mono", "Space Mono", "IBM Plex Mono", "Geist Mono", "Roboto Mono"],
  },
];

const CURATED_FLAT = CURATED.flatMap((g) => g.fonts);
// Catálogo completo de Google Fonts (best-effort, con fallback a la curada).
const CATALOG_URL = "https://gwfh.mranftl.com/api/fonts";

type CatalogEntry = { family: string; variants: string[] };

const DEFAULT_WEIGHTS = "400;500;600;700;800";

/** Pesos verticales reales de la familia (sin itálicas), hasta 800, que es
    lo máximo que usa el sitio. Si no hay catálogo, se piden los habituales:
    la API de Google Fonts ignora los pesos que la familia no tiene. */
function weightsFor(entry: CatalogEntry | undefined): string {
  if (!entry) return DEFAULT_WEIGHTS;
  const weights = new Set<number>();
  for (const v of entry.variants) {
    if (v === "regular") weights.add(400);
    else if (/^\d+$/.test(v)) {
      const w = parseInt(v, 10);
      if (w >= 100 && w <= 800) weights.add(w);
    }
  }
  if (weights.size === 0) weights.add(400);
  return [...weights].sort((a, b) => a - b).join(";");
}

function css2Url(family: string, weights: string) {
  const fam = family.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${fam}:wght@${weights}&display=swap`;
}

/** Espera a que la hoja de la fuente se cargue (o falle) antes de comprobar:
    sin esto, la comprobación podía correr antes de que el navegador conociera
    las @font-face nuevas y marcar "no encontrada" una fuente válida. */
function waitForSheet(link: HTMLLinkElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => resolve();
    link.addEventListener("load", done, { once: true });
    link.addEventListener("error", done, { once: true });
    setTimeout(done, 4000);
  });
}

async function applyFontFamily(family: string, weights: string): Promise<boolean> {
  if (family === DEFAULT_FONT) {
    document.getElementById("font-preview-link")?.remove();
    document.documentElement.style.removeProperty("--font-body");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* sin storage: la vista previa solo vive en esta página */
    }
    return true;
  }
  let link = document.getElementById("font-preview-link") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "font-preview-link";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  link.href = css2Url(family, weights);
  document.documentElement.style.setProperty("--font-body", `"${family}", ${FALLBACKS}`);
  try {
    localStorage.setItem(STORAGE_KEY, family);
  } catch {
    /* sin storage: la vista previa solo vive en esta página */
  }
  await waitForSheet(link);
  try {
    await document.fonts.load(`16px "${family}"`);
  } catch {
    return false;
  }
  return document.fonts.check(`16px "${family}"`);
}

export default function FontPicker() {
  const [open, setOpen] = useState(false);
  // La elección guardada se lee en el inicializador (no en un efecto) para
  // no disparar un render en cascada. No se renderiza hasta abrir el panel,
  // así que no hay riesgo de mismatch de hidratación.
  const [current, setCurrent] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_FONT;
    try {
      return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_FONT;
    } catch {
      return DEFAULT_FONT;
    }
  });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "not-found">("idle");
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);

  // Aplicar la elección guardada al montar y cargar el catálogo completo (best-effort).
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    if (saved && saved !== DEFAULT_FONT) {
      void applyFontFamily(saved, DEFAULT_WEIGHTS).then((ok) =>
        setStatus(ok ? "ok" : "not-found"),
      );
    }
    let cancelled = false;
    fetch(CATALOG_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("catalogo no disponible"))))
      .then((list: CatalogEntry[]) => {
        if (!cancelled && Array.isArray(list)) {
          setCatalog(
            list
              .filter((f) => typeof f?.family === "string")
              .sort((a, b) => a.family.localeCompare(b.family)),
          );
        }
      })
      .catch(() => {
        /* sin catálogo: queda la lista curada */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(
    () => catalog?.map((f) => f.family) ?? CURATED_FLAT,
    [catalog],
  );

  /** Resuelve lo escrito al nombre exacto del catálogo (sin importar
      mayúsculas ni espacios de más); si no está, se usa tal cual se escribió. */
  const resolveEntry = (name: string): { family: string; entry?: CatalogEntry } => {
    const clean = name.trim().replace(/\s+/g, " ");
    const lower = clean.toLowerCase();
    const hit = catalog?.find((f) => f.family.toLowerCase() === lower);
    if (hit) return { family: hit.family, entry: hit };
    const curated = CURATED_FLAT.find((f) => f.toLowerCase() === lower);
    if (curated) return { family: curated };
    return { family: clean };
  };

  const apply = (family: string) => {
    const { family: name, entry } = resolveEntry(family);
    if (!name) return;
    setCurrent(name);
    setStatus("loading");
    void applyFontFamily(name, weightsFor(entry)).then((ok) =>
      setStatus(ok ? "ok" : "not-found"),
    );
  };

  const inCurated = CURATED_FLAT.includes(current);

  return (
    <>
      {!open && (
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen(true)}
          aria-label="Elegir tipografía"
          title="Elegir tipografía"
        >
          Aa
        </button>
      )}
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Selector de tipografía">
          <div className={styles.head}>
            <span className={styles.title}>Tipografía</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Cerrar selector"
            >
              ×
            </button>
          </div>

          <p className={styles.current}>
            Actual: <b>{current}</b>
            {status === "loading" && <span className={styles.status}>Cargando…</span>}
            {status === "ok" && current !== DEFAULT_FONT && (
              <span className={styles.status}>Cargada ✓</span>
            )}
            {status === "not-found" && (
              <span className={`${styles.status} ${styles.statusError}`}>
                No se encontró en Google Fonts
              </span>
            )}
          </p>

          <label className={styles.label} htmlFor="font-pick-list">
            De la lista
          </label>
          <select
            id="font-pick-list"
            className={styles.select}
            value={inCurated ? current : ""}
            onChange={(e) => {
              if (e.target.value) apply(e.target.value);
            }}
          >
            <option value="" disabled>
              Elegir…
            </option>
            {CURATED.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.fonts.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply(query);
            }}
          >
            <label className={styles.label} htmlFor="font-pick-search">
              O buscar cualquier Google Font
            </label>
            <div className={styles.row}>
              <input
                id="font-pick-search"
                className={styles.input}
                list="font-catalog"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej. Space Grotesk…"
                autoComplete="off"
              />
              <datalist id="font-catalog">
                {suggestions.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
                Aplicar
              </button>
            </div>
          </form>

          <button
            type="button"
            className={`${styles.button} ${styles.reset}`}
            onClick={() => {
              setQuery("");
              apply(DEFAULT_FONT);
            }}
          >
            Volver a Manrope
          </button>

          <p className={styles.note}>
            Vista previa: se aplica a todo el sitio y se guarda en tu navegador hasta que elijas
            una definitiva.{" "}
            {catalog
              ? `Catálogo completo: ${catalog.length.toLocaleString("es-MX")} fuentes.`
              : "Catálogo básico: 40 fuentes (no se pudo cargar el catálogo completo)."}
          </p>
        </div>
      )}
    </>
  );
}
