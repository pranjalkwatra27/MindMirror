import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/MindMirror",
  assetPrefix: "/MindMirror/",
};

export default nextConfig;
