/** @type {import('next').NextConfig} */
const withLess = require("next-with-less");
const withImages = require("next-images");
const path = require("path");

const pjson = require("./package.json");
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  reactStrictMode: false,
  jsconfigPaths: true,
  output: "standalone",
  api: {
    bodyParser: {
      sizeLimit: "2mb", // Set desired value here
    },
  },
  images: {
    domains: ["mtbird-cdn.staringos.com"],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!config.externals) {
      config.externals = {};
    }
    config.externals.react = "react";

    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    // path
    config.resolve.alias["react"] = path.resolve(
      __dirname,
      "./node_modules/react"
    );
    config.resolve.alias["react-dom"] = path.resolve(
      __dirname,
      "./node_modules/react-dom"
    );
    config.resolve.alias["antd"] = path.resolve(
      __dirname,
      "./node_modules/antd"
    );
    config.resolve.alias["@mtbird/shared"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/shared"
    );
    config.resolve.alias["@mtbird/renderer-web"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/renderer-web"
    );
    config.resolve.alias["@mtbird/component-basic"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/component-basic"
    );
    config.resolve.alias["@mtbird/core"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/core"
    );
    config.resolve.alias["@mtbird/helper-component"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/helper-component"
    );
    config.resolve.alias["@mtbird/helper-extension"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/helper-extension"
    );
    config.resolve.alias["@mtbird/ui"] = path.resolve(
      __dirname,
      "./node_modules/@mtbird/ui"
    );
    return config;
  },
  // async redirects() {
  //   if (process.env.NEXT_PUBLIC_IS_INSTALL != "true") {
  //     return [
  //       {
  //         source: '/((?!install|api\/installer).*)',
  //         destination: '/install', // 重定向到 /xxx
  //         permanent: false, // 选择 302 临时重定向
  //       },
  //     ];
  //   }

  //   return []
  // },
  async rewrites() {
    const router = [
      {
        source: "/api/ai/:path*",
        destination: "https://staringai.com/api/:path*",
      },
      {
        source: "/api/sp/:path*",
        destination: "https://msp.apis.staringos.com/:path*",
      },
    ];

    return router;
  },
};

module.exports = withImages(withLess(nextConfig));
