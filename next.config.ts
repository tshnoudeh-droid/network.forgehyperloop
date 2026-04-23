import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // globe.gl and three are client-only; transpile so bundler handles ESM correctly
  transpilePackages: ["globe.gl", "three"],
  // Turbopack is default in Next 16; no server-side externals needed since
  // globe is loaded with dynamic(..., { ssr: false })
  turbopack: {},
};

export default nextConfig;
