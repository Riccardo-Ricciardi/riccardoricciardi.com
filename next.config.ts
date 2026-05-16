import path from "node:path";
import type { NextConfig } from "next";

const supabaseHostname = (() => {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
    }
  } catch {
    /* noop */
  }
  return "yfzqurdmbllthonjdzpb.supabase.co";
})();

const isProd = process.env.NODE_ENV === "production";

// 'unsafe-eval' is only needed by Turbopack/HMR in dev. Drop it in production.
// 'unsafe-inline' remains for Next.js bootstrap inline scripts; tightening to a
// nonce/strict-dynamic policy is tracked as a follow-up.
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
