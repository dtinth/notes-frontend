import { defineConfig } from "vitest/config";
import inject from "@rollup/plugin-inject";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    inject({
      Buffer: ["buffer-es6", "Buffer"],
      global: [__dirname + "/src/shims/global.ts", "global"],
    }),
  ],
  build: {
    rollupOptions: {
      external: ["@swc/core"],
      output: {
        entryFileNames: `runtime/[name].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css") {
            return `runtime/[name][extname]`;
          } else {
            return `assets/[name]-[hash][extname]`;
          }
        },
      },
    },
  },
  resolve: {
    alias: {},
  },
  optimizeDeps: {
    exclude: ["@swc/core", __dirname + "/src/shims/global.ts"],
  },
  test: {
    server: {
      deps: {
        inline: [/@vue\/repl.*/],
      },
    },
  },
});
