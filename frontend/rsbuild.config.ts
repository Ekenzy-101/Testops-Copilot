import path from "path";
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSass } from "@rsbuild/plugin-sass";
import { pluginSvgr } from "@rsbuild/plugin-svgr";

const { publicVars, rawPublicVars } = loadEnv();

export default defineConfig({
  html: {
    template: "./public/index.html",
  },
  output: {
    distPath: {
      root: "build",
    },
  },
  plugins: [
    pluginNodePolyfill(),
    pluginReact(),
    pluginSass(),
    pluginSvgr({ mixedImport: true }),
  ],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  source: {
    define: {
      ...publicVars,
      "process.env": JSON.stringify(rawPublicVars),
    },
    // Compile all JS files and exclude core-js
    include: [{ not: /[\\/]core-js[\\/]/ }],
  },
});
