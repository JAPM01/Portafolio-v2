import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** "full" = desktop GPU, "lite" = phones/tablets/low memory, "none" = no WebGL */
export type GpuTier = "full" | "lite" | "none" | "pending";
export function useGpuTier(): GpuTier {
  const [tier, setTier] = useState<GpuTier>("pending");
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return setTier("none");
      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowMem = (nav.deviceMemory ?? 8) <= 4;
      const small = window.innerWidth < 1024;
      const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
      setTier(lowMem || small || fewCores ? "lite" : "full");
    } catch {
      setTier("none");
    }
  }, []);
  return tier;
}

export function useInView<T extends Element>(threshold = 0.2) {
  const [el, setEl] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) setInView(true); }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [el, threshold]);
  return [setEl, inView] as const;
}

/** Visible-on-screen flag that toggles both ways (used to pause 3D loops off-screen). */
export function useOnScreen<T extends Element>() {
  const [el, setEl] = useState<T | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(!!e?.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);
  return [setEl, on] as const;
}
