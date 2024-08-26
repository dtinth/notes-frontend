import "@fontsource/arimo/400.css";
import "@fontsource/arimo/500.css";
import "@fontsource/arimo/600.css";
import "@fontsource/arimo/700.css";
import "comic-mono/index.css";
import { CompiledNote } from "./compiler";
import "./custom-elements/d-split";
import "./custom-elements/notes-page-footer";
import { flashMessage } from "./flash-message";
import { fetchPublicNoteContents } from "./io";
import { processTitle, wrapHtml } from "./linker";
import "./style.css";

async function main() {
  if (location.pathname === "/preview") {
    return runPreviewer();
  } else {
    return runNormal();
  }
}

async function getCompiler() {
  Object.assign(window, { global: window, process: { env: {} } });
  // @ts-ignore
  const { Buffer } = await import("buffer-es6");
  Object.assign(window, { Buffer });
  return import(
    /* @vite-ignore */ location.origin + "/lib/compiler/index.js"
  ) as Promise<typeof import("./compiler")>;
}

async function runPreviewer() {
  showStatus("Loading compiler...");
  const { compileMarkdown } = await getCompiler();
  Object.assign(window, { compileMarkdown });
  showStatus("Compiling...");
  const result = await compileMarkdown("whee!", "Preview");
  console.log(result);
  await runCompiled(result.compiled);
}

async function runDynamic(slug: string) {
  flashMessage("Loading notes contents...");
  const contents = await fetchPublicNoteContents(slug);
  flashMessage("Loading compiler...");
  const { compileMarkdown } = await getCompiler();
  Object.assign(window, { compileMarkdown });
  flashMessage("Compiling...");
  const result = await compileMarkdown(contents, slug);
  flashMessage("Running...");
  await runCompiled(result.compiled);
  flashMessage("");
}

async function runNormal() {
  const precompilation = window as unknown as {
    precompiledNoteBehavior?: Function;
  };
  if (precompilation.precompiledNoteBehavior) {
    await runPrecompiled(precompilation.precompiledNoteBehavior);
  } else {
    const pathname = location.pathname;
    const match = pathname.match(/^\/([A-Za-z0-9]+)$/);
    if (match) {
      await runDynamic(match[1]);
    } else {
      await runDynamic("HomePage");
    }
  }
}

function showStatus(status: string) {
  document.querySelector("#mainContents")!.innerHTML = `
  <div class="prose">
    <h1>${status}</h1>
  </div>
  `;
}

async function runCompiled(compiled: CompiledNote) {
  document.querySelector("#mainContents")!.innerHTML = `
    <style>${compiled.css}</style>
    ${wrapHtml(compiled.html)}
  `;
  document.title = processTitle(compiled.title);
  for (const [key, value] of Object.entries(compiled.dataset)) {
    document.documentElement.dataset[key] = value;
  }
  console.log(
    'This note has been dynamically compiled. To inspect the compiled code, open the console and type "compiled".'
  );
  Object.assign(window, { compiled });
  const { hydrate } = await import("./runtime/vue3");
  hydrate(compiled.js, "#noteContents");
}

async function runPrecompiled(precompiledNoteBehavior: Function) {
  const { hydrate } = await import("./runtime/vue3");
  hydrate(precompiledNoteBehavior, "#noteContents");
}

main();
