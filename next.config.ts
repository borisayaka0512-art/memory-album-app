import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 写真アップロードはServer Actionのmultipartボディとして送るため、
      // デフォルトの1MB上限だとスマホ写真1〜2枚ですぐ超えてしまう。
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
