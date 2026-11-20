import type { NextConfig } from "next";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;
const nextConfig: NextConfig = {
  output: "export",
  ...(basePath ? { basePath } : {}),
};
export default nextConfig;
