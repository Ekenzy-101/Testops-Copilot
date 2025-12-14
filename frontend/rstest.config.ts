import { defineConfig } from "@rstest/core";
import rsbuildConfig from "./rsbuild.config";

export default defineConfig({
  coverage: {
    enabled: true,
    thresholds: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  globals: true,
  plugins: rsbuildConfig.plugins,
  setupFiles: ["./rstest.setup.ts"],
  testEnvironment: "jsdom",
});
