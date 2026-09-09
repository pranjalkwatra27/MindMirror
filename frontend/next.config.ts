import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/MindMirror",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
