import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "lib"),
    lib: {
      entry: path.resolve(__dirname, "src/compiler/index.ts"),
      formats: ["es"],
      name: "NoteCompiler",
      fileName: (format) => `compiler.js`,
    },
    rollupOptions: {
      external: [
        "vitepress",
        "vitepress/dist/node/index.js",
        "rollup",
        "@rollup/plugin-inject",
        "vue",
        "vue/compiler-sfc",
        "vue/server-renderer",
        "fsevents",
      ],
    },
  },
});
