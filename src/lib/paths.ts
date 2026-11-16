/** Prefijo de subruta para despliegues bajo un path (GitHub Pages).
    En local es "" y todo queda igual; en Pages vale "/Portafolio-v2". */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const px = (p: string) => `${BASE}${p}`;
