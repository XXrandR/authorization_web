import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const authorizationApi =
      process.env.AUTHORIZATION_API_URL ?? "http://localhost:8080";
    return [
      { source: "/api/:path*", destination: `${authorizationApi}/api/:path*` },
      {
        source: "/api/v1/:path*",
        destination: `${authorizationApi}/api/v1/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${authorizationApi}/oauth2/:path*`,
      },
      {
        source: "/api/auth/login",
        destination: `${authorizationApi}/api/auth/login`,
      },
      {
        source: "/.well-known/:path*",
        destination: `${authorizationApi}/.well-known/:path*`,
      },
    ];
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
