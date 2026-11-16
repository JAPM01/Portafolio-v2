import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
