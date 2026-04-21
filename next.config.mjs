/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler runs extra transforms on every compile; keep it for production only to reduce dev CPU.
  reactCompiler: false,
  logging: {
    browserToTerminal: false,
  },
};

export default nextConfig;
