import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: ["@markme/ui", "@markme/api", "@markme/db", "@markme/ai"],
    // Monorepo: include files outside apps/web in serverless traces
    outputFileTracingRoot: path.join(__dirname, "../.."),
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons**" },
        ],
    },
};

export default nextConfig;
