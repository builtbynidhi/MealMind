/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Transformers.js (bge-small embeddings) uses native onnxruntime-node — must not be
  // bundled by webpack/turbopack. It runs only in Node server routes / indexer scripts.
  serverExternalPackages: ["@xenova/transformers"],
};

export default nextConfig;
