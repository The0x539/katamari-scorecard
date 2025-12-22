import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";

export default defineConfig({
  html: {
    template: "./src/index.html",
  },
  dev: {
    // this seems to break the dynamic temporal-polyfill import
    lazyCompilation: false,
  },
  output: {
    cleanDistPath: true,
  },
  source: {
    assetsInclude: /\.jxl$/,
  },
  plugins: [
    pluginPreact(),
    pluginTypeCheck(),
  ],
});
