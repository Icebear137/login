import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "devcms.thuvien.edu.vn",
        port: "",
        pathname: "/images/**",
        search: "",
      },
    ],
  },
  // reactStrictMode: false,
};

export default nextConfig;
