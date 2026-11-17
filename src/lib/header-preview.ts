/** Shared dev-only header comparison state.
 * Kept outside components so the global navbar and floating development
 * menu stay synchronized without moving existing page markup.
 */
export type HeaderPreview = "original" | "header1" | "header2";

const STORAGE_KEY = "jpm-header-preview";
const CHANGE_EVENT = "jpm-header-preview-change";
const STATUS_EVENT = "jpm-header-preview-status";

function parsePreview(value: string | undefined | null): HeaderPreview {
  return value === "header1" || value === "header2" ? value : "original";
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
