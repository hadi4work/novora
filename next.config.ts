import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.highperformanceformat.com https://quarrelsomebitter.com https://cdn.radiantmediatechs.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              // Ad networks load iframes from rotating third-party domains.
              "frame-src 'self' https:",
              "connect-src 'self' https://*.supabase.co https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://www.googletagmanager.com https://www.highperformanceformat.com https://quarrelsomebitter.com https:",
            ].join("; ") + ";",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
