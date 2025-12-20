import { defineConfig } from "@rsbuild/core";
import { pluginPreact } from "@rsbuild/plugin-preact";

export default defineConfig({
  html: {
    template: "./src/index.html",
  },
  source: {
    assetsInclude: /\.jxl$/,
  },
  plugins: [pluginPreact()],
});
