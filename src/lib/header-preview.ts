/** Shared dev-only header comparison state.
 * Kept outside components so the global navbar and floating development
 * menu stay synchronized without moving existing page markup.
 */
export type HeaderPreview = "original" | "header1";

const STORAGE_KEY = "jpm-header-preview-v2";
const CHANGE_EVENT = "jpm-header-preview-change";
const STATUS_EVENT = "jpm-header-preview-status";

function parsePreview(value: string | undefined | null): HeaderPreview {
  // "original" (liquid-glass-react) es el default: su geometría es
  // correcta en móvil y desktop (la cápsula llega a ambos márgenes y el
  // header funciona en desktop). "header1" (liquidGL) queda disponible
  // para comparar, pero su canvas se desalinea en móvil (-12px/-8px, la
  // cápsula no llega al margen derecho) y en desktop renderiza un blob
  // en vez de la píldora. Clave v2: la v1 guardaba "header1" como default.
  return value === "header1" ? "header1" : "original";
}

export function getHeaderPreview(): HeaderPreview {
  return parsePreview(document.documentElement.dataset.headerPreview);
}

export function getServerHeaderPreview(): HeaderPreview {
  return "original";
}

export function subscribeHeaderPreview(listener: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

export function setHeaderPreview(value: HeaderPreview): void {
  document.documentElement.dataset.headerPreview = value;
  document.documentElement.dataset.headerPreviewStatus = "";
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // The dev selector also works with storage disabled.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  window.dispatchEvent(new Event(STATUS_EVENT));
}

export function hydrateHeaderPreview(): void {
  try {
    setHeaderPreview(parsePreview(window.localStorage.getItem(STORAGE_KEY)));
  } catch {
    setHeaderPreview("original");
  }
}

export function setHeaderPreviewStatus(status: string): void {
  document.documentElement.dataset.headerPreviewStatus = status;
  window.dispatchEvent(new Event(STATUS_EVENT));
}

export function subscribeHeaderPreviewStatus(listener: () => void): () => void {
  window.addEventListener(STATUS_EVENT, listener);
  return () => window.removeEventListener(STATUS_EVENT, listener);
}

export function getHeaderPreviewStatus(): string {
  return document.documentElement.dataset.headerPreviewStatus || "";
}

export function getServerHeaderPreviewStatus(): string {
  return "";
}
