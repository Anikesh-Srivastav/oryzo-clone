/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler runs extra transforms on every compile; keep it for production only to reduce dev CPU.
  reactCompiler: false,
  logging: {
    browserToTerminal: false,
  },
  async headers() {
    return [
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
