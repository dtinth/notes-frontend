import vue from "@vitejs/plugin-vue";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [vue()],
  resolve: {
    conditions: ["worker"],
    alias: [
      { find: /^vue$/, replacement: "vue/dist/vue.runtime.esm-browser.js" },
      {
        find: /^vue\/compiler-sfc$/,
        replacement: "@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js",
      },
    ],
  },
  build: {
    outDir: path.resolve(__dirname, "dist/compiler"),
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      name: "NoteCompiler",
      fileName: () => `index.js`,
    },
    rollupOptions: {
      output: {
        entryFileNames: (chunkInfo) => {
          return "[name].js";
        },
        chunkFileNames: (chunkInfo) => {
          return "[name]_[hash].js";
        },
        manualChunks: {
          unocss: ["@unocss/core", "@unocss/preset-uno"],
          vue: ["vue", "vue/compiler-sfc", "vue/server-renderer"],
          "vue-repl": ["@vue/repl"],
          micromark: [
            "micromark",
            "micromark-extension-directive",
            "micromark-extension-gfm-footnote",
            "micromark-extension-gfm-strikethrough",
            "micromark-extension-gfm-table",
          ],
          shiki: ["shiki/wasm", "shiki/core"],
          "shiki-langs": ["./src/shikiLangs"],
          sucrase: ["sucrase"],
          "gray-matter": ["gray-matter"],
          rehype: ["rehype"],
          "rehype-plugins": [
            "rehype-autolink-headings",
            "rehype-slug",
            "rehype-vue-sfc",
            "@shikijs/rehype/core",
          ],
        },
      },
    },
  },
});
