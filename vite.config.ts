import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
        manualChunks: {
          vue: ["vue"],
          supabase: ["@supabase/supabase-js"],
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
