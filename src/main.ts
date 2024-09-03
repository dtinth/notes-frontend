import "@fontsource/arimo/400.css";
import "@fontsource/arimo/500.css";
import "@fontsource/arimo/600.css";
import "@fontsource/arimo/700.css";
import "comic-mono/index.css";
import "littlefoot/dist/littlefoot.css";
import "../vendor/raster.grid.css";
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

async function addHeaderToolbar() {
  const toolbar = document.getElementById("headerToolbar") as HTMLDivElement;

  const webringIcon = {
    body: `<path fill-rule="evenodd" clip-rule="evenodd" d="M53 128.8l-16-8.2a192 192 0 1094.7-88.9l7.1 16.6A174 174 0 1153 128.8z" fill="#8b8685"></path> <path d="M94.7 92.3L82 126.5 62.6 95.7l-36.4-1.4 23.3-28-9.9-35.1 33.9 13.5 30.3-20.3-2.4 36.4L130 83.3l-35.3 9z" fill="#d7fc70"></path>`,
    width: 416,
    height: 416,
  };
  const webring = document.createElement("a");
  webring.className = "flex items-center";
  webring.href = "https://webring.wonderful.software/#dt.in.th";
  webring.title = "วงแหวนเว็บ (webring)";
  const icon = document.createElement("iconify-icon");
  icon.setAttribute("icon", JSON.stringify(webringIcon));
  icon.setAttribute("height", "32");
  webring.appendChild(icon);
  toolbar.appendChild(webring);
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
addHeaderToolbar();
