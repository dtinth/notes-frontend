import { executeCjs, registerComponents } from "@notes/runtime";
import type { CompiledNote } from "@notes/types";
import { createGenerator } from "@unocss/core";
import presetUno from "@unocss/preset-uno";
import type { File, Store } from "@vue/repl";
import * as Vue from "vue";
import * as compiler from "vue/compiler-sfc";
import * as VueServerRenderer from "vue/server-renderer";
import { markdownToVue } from "./markdown";
export type * from "@notes/types";

const uno = createGenerator({
  presets: [presetUno({ preflight: false })],
  extendTheme: (theme) => {
    theme.fontFamily ??= {};
    theme.fontFamily.sans = [
      "Arimo",
      "Helvetica",
      "Arial",
      theme.fontFamily.sans,
    ].join(", ");
    theme.fontFamily.mono = ["Comic Mono", theme.fontFamily.mono].join(", ");
  },
});

const vueGlobalComponents = new Set(["d-split"]);

export interface CompileMarkdownResult {
  compiled: CompiledNote;
  errors: string[];
  debuggingInfo: DebuggingInfo;
  log: [time: number, message: string][];
}

export interface DebuggingInfo {
  vueTemplate?: string;
  ssrEsm?: string;
  ssrCjs?: string;
  clientEsm?: string;
}

export async function compileMarkdown(
  source: string,
  slug: string
): Promise<CompileMarkdownResult> {
  const result: CompileMarkdownResult = {
    compiled: {
      html: "<!-- Compilation unsuccessful -->",
      css: "/* Compilation unsuccessful */",
      js: "/* Compilation unsuccessful */",
      title: slug,
      dataset: {},
      head: [],
      frontMatter: {},
    },
    errors: [],
    debuggingInfo: {},
    log: [],
  };
  const log = (message: string) => {
    result.log.push([performance.now(), message]);
  };

  try {
    // Step 1: Markdown -> Vue SFC
    let { vueTemplate, frontMatter } = await markdownToVue(source, log);
    result.debuggingInfo.vueTemplate = vueTemplate;
    result.compiled.frontMatter = frontMatter;

    // Step 2: Add UnoCSS
    {
      const extraCss = await uno.generate(vueTemplate);
      if (extraCss.css) {
        vueTemplate += `\n<style scoped>${extraCss.css}</style>`;
        result.debuggingInfo.vueTemplate = vueTemplate;
      }
      log("unocss processed");
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
    log("vue compiler imported");

    const store = {
      compiler,
      sfcOptions: {
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) =>
              tag.includes("-") && !vueGlobalComponents.has(tag),
          },
        },
      },
    } as unknown as Store;
    const file = {
      filename: "Note.vue",
      code: vueTemplate,
      compiled: { js: "", css: "", ssr: "" },
    } as File;
    const errors = await repl.compileFile(store, file);
    log("vue compiler finished");

    if (errors.length) {
      for (const error of errors) {
        result.errors.push(errorToString(error));
      }
      throw new Error("Failed to compile Vue SFC: " + errors.join(", "));
    }
    result.debuggingInfo.ssrEsm = file.compiled.ssr;
    result.debuggingInfo.clientEsm = file.compiled.js;

    // Step 4: Convert ESM to CJS
    log("converting ssr");
    const ssr = await esmToCjs(file.compiled.ssr, log);
    result.debuggingInfo.ssrCjs = ssr;

    log("converting js");
    const js = await esmToCjs(file.compiled.js, log);
    result.compiled.js = js;

    const css = file.compiled.css;
    result.compiled.css = css;

    // Step 5: SSR
    log("executing ssr");
    const ssrResult = executeCjs(ssr, {
      "vue/server-renderer": VueServerRenderer,
    });
    const Component = ssrResult.default;
    const app = Vue.createSSRApp(Component);
    registerComponents(app);
    const html = await VueServerRenderer.renderToString(app);
    result.compiled.html = html;
    log("ssr executed");

    // Step 6: Add metadata
    if (frontMatter.wide) {
      result.compiled.dataset["layout"] = "wide";
    }
    if (frontMatter.title) {
      result.compiled.title = frontMatter.title;
    }
    const ogImage = `https://screenshot.source.in.th/image/_/notes/${slug}`;
    result.compiled.head.push(
      ["meta", { property: "og:title", content: result.compiled.title }],
      ["meta", { property: "og:image", content: ogImage }],
      ["meta", { property: "og:image:width", content: "1800" }],
      ["meta", { property: "og:image:height", content: "1680" }]
    );
    const canonicalUrl = `https://dt.in.th/${slug}`;
    result.compiled.head.push([
      "link",
      { rel: "canonical", href: canonicalUrl },
    ]);
  } catch (e) {
    result.errors.push(errorToString(e));
  }
  return result;
}

function errorToString(e: unknown) {
  return String(typeof e === "object" && e && "stack" in e ? e.stack : e);
}

async function esmToCjs(
  esm: string,
  log: (message: string) => void = () => {}
) {
  log("esmToCjs started");
  const sucrase = await import("sucrase");

  log("sucrase imported");
  const result = sucrase.transform(esm, {
    transforms: ["imports"],
    preserveDynamicImport: true,
  });
  log("transformed");
  return result.code;
}
