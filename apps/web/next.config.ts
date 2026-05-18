import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lucyn/ai", "@lucyn/db", "@lucyn/github", "@lucyn/compression"],
  // Prevent Next.js from bundling Prisma's native query engine binary.
  // @prisma/client must be loaded from node_modules at runtime, not bundled.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
};

export default nextConfig;
