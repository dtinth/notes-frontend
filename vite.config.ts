import { defineConfig } from "vitest/config";
import inject from "@rollup/plugin-inject";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `runtime/[name].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css") {
            return `runtime/[name][extname]`;
          } else {
            return `runtime/assets/[name]-[hash][extname]`;
          }
        },
      },
    },
  },
  test: {
    server: {
      deps: {
        inline: [/@vue\/repl.*/],
      },
    },
  },
});
