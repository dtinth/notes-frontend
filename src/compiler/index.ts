import { createGenerator } from "@unocss/core";
import presetUno from "@unocss/preset-uno";
import type { File, Store } from "@vue/repl";
import * as Vue from "vue";
import * as compiler from "vue/compiler-sfc";
import * as VueServerRenderer from "vue/server-renderer";
import { executeCjs } from "../runtime/vue3";
import { markdownToVue } from "./markdown";

const uno = createGenerator({
  presets: [presetUno({ preflight: false })],
});

export async function compileMarkdown(source: string) {
  // Step 1: Markdown -> Vue SFC
  let { vueTemplate, frontMatter } = await markdownToVue(source);

  // Step 2: Add UnoCSS
  {
    const extraCss = await uno.generate(vueTemplate);
    if (extraCss.css) {
      vueTemplate += `\n<style scoped>${extraCss.css}</style>`;
    }
  }

  /*!
   * This function includes code yoinked from @vue/repl.
   * https://github.com/vuejs/repl/blob/main/src/transform.ts
   * Copyright (c) 2021-present, Yuxi (Evan) You
   *
   * Used under the MIT License
   */
  // Step 3: Vue SFC -> Compiled Vue Component (JS, CSS, SSR)
  const repl = await import("@vue/repl");
  const store = { compiler, sfcOptions: {} } as Store;
  const file = {
    filename: "Note.vue",
    code: vueTemplate,
    compiled: { js: "", css: "", ssr: "" },
  } as File;
  const errors = await repl.compileFile(store, file);
  if (errors.length) {
    console.error(errors);
    throw new Error("Failed to compile Vue SFC: " + errors.join(", "));
  }

  // Step 4: Convert ESM to CJS
  const ssr = await esmToCjs(file.compiled.ssr);
  const js = await esmToCjs(file.compiled.js);
  const css = file.compiled.css;

  // Step 5: SSR
  const ssrResult = executeCjs(ssr, {
    "vue/server-renderer": VueServerRenderer,
  });
  const Component = ssrResult.default;
  const app = Vue.createSSRApp(Component);
  const html = await VueServerRenderer.renderToString(app);

  return { runtime: "vue3", html, css, js, frontMatter };
}

async function esmToCjs(esm: string) {
  const { default: initSwc, transformSync } =
    typeof window !== "undefined"
      ? await import("@swc/wasm-web")
      : await import("@swc/core");

  if (typeof initSwc === "function" && typeof window !== "undefined") {
    await initSwc(
      "https://cdn.jsdelivr.net/npm/@swc/wasm-web@1.7.10/wasm_bg.wasm"
    );
  }

  return transformSync(esm, {
    jsc: {
      target: "es2022",
    },
    module: {
      type: "commonjs",
    },
  }).code;
}
