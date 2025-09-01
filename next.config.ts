import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/mdt",
        destination: "/mdt.html",
        permanent: false,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "mobitech-uploads.s3.ap-south-1.amazonaws.com",
      `${process.env.MB_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com`,
      "avatar.iran.liara.run",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fdn2.gsmarena.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gsmarena.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn1.smartprix.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
