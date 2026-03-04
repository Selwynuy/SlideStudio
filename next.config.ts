import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Ensure @sparticuz/chromium and puppeteer-core are available to the
   * serverless function in production (e.g. on Vercel).
   */
  experimental: {
    serverComponentsExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  },
  // Next.js also supports a non-experimental variant in some versions.
  // Keeping both improves compatibility across Next releases.
  // (Unknown keys are ignored.)
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  /**
   * Make sure the Chromium package (including its /bin brotli files) is
   * traced into the export API route bundle.
   *
   * NOTE: For App Router API routes, the key must be the full relative
   * file path including extension (e.g. "app/api/export/route.ts").
   */
  outputFileTracingIncludes: {
    "app/api/export/route.ts": ["./node_modules/@sparticuz/chromium/**"],
  },
};

export default nextConfig;
