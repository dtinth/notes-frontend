import { defineConfig } from "vitest/config";

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
  test: {
    server: {
      deps: {
        inline: [/@vue\/repl.*/],
      },
    },
  },
});
