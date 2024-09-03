import { createGenerator } from "@unocss/core";
import presetUno from "@unocss/preset-uno";
import type { File, Store } from "@vue/repl";
import escape from "lodash-es/escape";
import * as Vue from "vue";
import * as compiler from "vue/compiler-sfc";
import * as VueServerRenderer from "vue/server-renderer";
import { processTitle, wrapHtml } from "../linker";
import { executeCjs, registerComponents } from "../runtime/vue3";
import { markdownToVue } from "./markdown";

const uno = createGenerator({
  presets: [presetUno({ preflight: false })],
});

export interface CompileMarkdownResult {
  compiled: CompiledNote;
  frontMatter: Record<string, any>;
  errors: string[];
  debuggingInfo: DebuggingInfo;
  log: [time: number, message: string][];
}

export interface CompiledNote {
  /** HTML of the rendered note */
  html: string;

  /** CSS of the rendered note */
  css: string;

  /** JavaScript code for the Vue component, compiled to CJS */
  js: string;

  /** Page title */
  title: string;

  /** data attributes to apply to the root element */
  dataset: Record<string, string>;

  /** Elements to add to the head of the page */
  head: HeadElement[];
}

type HeadElement =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string];

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
    },
    frontMatter: {},
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
    result.frontMatter = frontMatter;

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

    const store = { compiler, sfcOptions: {} } as Store;
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
  });
  log("transformed");
  return result.code;
}

export function applyTemplate(input: {
  template: string;
  compiled: {
    dataset: Record<string, string>;
    title: string;
    css: string;
    js: string;
    html: string;
  };
  breadcrumb?: string;
}) {
  const { template, compiled, breadcrumb } = input;
  let html = template;

  let dataAttributes = " data-precompiled=true";
  for (const [key, value] of Object.entries(compiled.dataset)) {
    dataAttributes += ` data-${key}="${escape(value)}"`;
  }

  html = html.replace(/<html/, () => `<html` + dataAttributes);
  html = html.replace(
    /<script id="head-placeholder"[^]*?<\/script>/,
    () =>
      `<title>${escape(processTitle(compiled.title))}</title>` +
      (!compiled.css || compiled.css === "/* No <style> tags present */"
        ? ""
        : `<style>${compiled.css}</style>`)
  );
  html = html.replace(
    /<script id="js-placeholder"[^]*?<\/script>/,
    () =>
      `<script>window.precompiledNoteBehavior = function(require, exports, module, Vue) {${compiled.js}}</script>`
  );
  if (breadcrumb != null) {
    html = html.replace(
      /<breadcrumb-placeholder>([^]*?)<\/breadcrumb-placeholder>/,
      () => breadcrumb
    );
  }
  html = html.replace(
    /<content-placeholder>([^]*?)<\/content-placeholder>/,
    () => wrapHtml(compiled.html)
  );
  return html;
}
