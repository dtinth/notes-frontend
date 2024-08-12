import inject from "@rollup/plugin-inject";
import type { File, Store } from "@vue/repl";
import * as rollup from "rollup";
import * as Vue from "vue";
import * as compiler from "vue/compiler-sfc";
import * as VueServerRenderer from "vue/server-renderer";
import { executeCjs } from "../runtime/vue3";
import { markdownToVue } from "./markdown";

export async function compileMarkdown(source: string) {
  // Step 1: Markdown -> Vue SFC
  const { vueTemplate, frontMatter } = await markdownToVue(source);
  console.log(vueTemplate);

  /*!
   * This function includes code yoinked from @vue/repl.
   * https://github.com/vuejs/repl/blob/main/src/transform.ts
   * Copyright (c) 2021-present, Yuxi (Evan) You
   *
   * Used under the MIT License
   */
  // Step 2: Vue SFC -> Compiled Vue Component (JS, CSS, SSR)
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

  // Step 3: Convert ESM to CJS
  const ssr = await esmToCjs(file.compiled.ssr);
  const js = await esmToCjs(file.compiled.js);
  const css = file.compiled.css;

  // Step 4: SSR
  const ssrResult = executeCjs(ssr, {
    "vue/server-renderer": VueServerRenderer,
  });
  const Component = ssrResult.default;
  const app = Vue.createSSRApp(Component);
  const html = await VueServerRenderer.renderToString(app);

  return { runtime: "vue3", html, css, js, frontMatter };
}

async function esmToCjs(esm: string) {
  // Use rollup to convert ESM to CJS
  const bundle = await rollup.rollup({
    input: "Note.vue",
    external: [/.*/],
    plugins: [
      {
        name: "virtual",
        resolveId(id) {
          if (id === "Note.vue") return id;
        },
        load(id) {
          if (id === "Note.vue") return esm;
        },
      },
      inject({
        Vue: "vue",
      }),
    ],
  });
  const { output } = await bundle.generate({ format: "cjs", exports: "named" });
  return output[0].code;
}
