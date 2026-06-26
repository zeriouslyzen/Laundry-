import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@humboldt/ui", "@humboldt/db"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
