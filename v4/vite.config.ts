import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Base del sitio en GitHub Pages: /Portafolio-v2/v4/ (env VITE_BASE_PATH).
// En local, sin la variable, queda en /.
const base = (process.env.VITE_BASE_PATH || "/").replace(/\/?$/, "/");

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
});
