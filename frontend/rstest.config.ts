import { defineConfig } from "@rstest/core";
import rsbuildConfig from "./rsbuild.config";

export default defineConfig({
  coverage: {
    thresholds: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    enabled: true,
  },
  globals: true,
  plugins: rsbuildConfig.plugins,
  setupFiles: ["./rstest.setup.ts"],
  testEnvironment: "jsdom",
});
