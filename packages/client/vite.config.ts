import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `runtime/entry/[name].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css") {
            return `runtime/entry/[name][extname]`;
          } else {
            return `runtime/assets/[name]-[hash][extname]`;
          }
        },
        chunkFileNames: `runtime/assets/[name]-[hash].js`,
        manualChunks: {
          vue: ["vue"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "tests/**/*", // Exclude Playwright tests
    ],
    server: {
      deps: {
        inline: [/@vue\/repl.*/],
      },
    },
  },
});
