import { defineConfig } from "vitest/config";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    exclude: ["vitepress/dist/node/index.js"],
  },
  test: {
    server: {
      deps: {
        inline: [/@vue\/repl.*/],
      },
    },
  },
});
