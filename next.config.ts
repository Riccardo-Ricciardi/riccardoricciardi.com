import path from "node:path";
import type { NextConfig } from "next";
import { getSupabaseUrlOptional, isProduction } from "./utils/env";

const supabaseHostname = (() => {
  try {
    const url = getSupabaseUrlOptional();
    if (url) return new URL(url).hostname;
  } catch {
    /* noop */
  }
  return "yfzqurdmbllthonjdzpb.supabase.co";
})();

const isProd = isProduction();

// 'unsafe-eval' is only needed by Turbopack/HMR in dev. Drop it in production.
//
// TODO(security): replace 'unsafe-inline' with a nonce + 'strict-dynamic' CSP.
// Blockers for this project:
//   1. Next.js App Router injects inline bootstrap + RSC flight-data scripts
//      (e.g. self.__next_f.push) that must all receive the per-request nonce.
//      In Next 16 this requires moving the CSP header out of next.config.ts
//      into proxy.ts (middleware) so the nonce can be generated per request
//      and forwarded via a request header that the root layout reads via
//      `headers()` to thread into every <Script nonce={...}> tag.
//   2. Vercel Analytics (va.vercel-scripts.com) and any future third-party
//      script must either accept the nonce or be covered by 'strict-dynamic'.
//   3. Static export / ISR pages cannot use a per-request nonce — the policy
//      must remain hash-based or 'unsafe-inline' for prerendered HTML.
// Tracking this as a separate hardening pass once the prerender/dynamic split
// is stable.
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https://${supabaseHostname} https://images.unsplash.com https://media.canva.com https://avatars.githubusercontent.com https://opengraph.githubassets.com https://raw.githubusercontent.com`,
      "font-src 'self' data:",
      `connect-src 'self' https://${supabaseHostname} https://api.github.com https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "country-flag-icons",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-select",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.canva.com" },
      { protocol: "https", hostname: supabaseHostname },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
