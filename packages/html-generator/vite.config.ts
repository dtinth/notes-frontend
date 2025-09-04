import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: false,
  plugins: [dts()],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    sourcemap: true,
    minify: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      name: "NoteHtmlGenerator",
      fileName: () => `index.js`,
    },
  },
});
