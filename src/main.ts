import "@fontsource/arimo/400-italic.css";
import "@fontsource/arimo/400.css";
import "@fontsource/arimo/500-italic.css";
import "@fontsource/arimo/500.css";
import "@fontsource/arimo/600-italic.css";
import "@fontsource/arimo/600.css";
import "@fontsource/arimo/700-italic.css";
import "@fontsource/arimo/700.css";
import memoizeOne from "async-memoize-one";
import "comic-mono/index.css";
import "littlefoot/dist/littlefoot.css";
import * as quicklink from "quicklink";
import "../vendor/raster.grid.css";
import { CompiledNote } from "./compiler";
import "./custom-elements/d-split";
import "./custom-elements/embed-container";
import "./custom-elements/note-footer";
import "./custom-elements/notes-bubble-author";
import "./custom-elements/notes-page-footer";
import "./custom-elements/youtube-embed";
import { flashMessage } from "./flash-message";
import { fetchPublicNoteContents, fetchTree } from "./io";
import {
  generateBreadcrumbHtml,
  generateBreadcrumbItems,
  processTitle,
  wrapHtml,
} from "./linker";
import { fetchPrivateNoteContents } from "./private-io";
import "./style.css";

function main() {
  addHeaderToolbar();
  checkScreenshotMode();
  enableQuickLink();
  addKeybinds();
  return runMain();
}

async function addHeaderToolbar() {
  const toolbar = document.getElementById("headerToolbar") as HTMLDivElement;

  const searchIcon = {
    width: 24,
    height: 24,
    body: '<path fill="currentColor" d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1l8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5a6.75 6.75 0 0 1 0 13.5z"/>',
  };
  const searchButton = document.createElement("button");
  searchButton.className = "flex items-center text-#8b8685";
  searchButton.title = "Search";
  searchButton.id = "search-button";
  const searchPromise = import("./search");
  searchButton.onclick = async () => {
    const { openSearch } = await searchPromise;
    openSearch();
  };
  const searchIconElement = document.createElement("iconify-icon");
  searchIconElement.setAttribute("icon", JSON.stringify(searchIcon));
  searchIconElement.setAttribute("height", "24");
  searchButton.appendChild(searchIconElement);
  toolbar.appendChild(searchButton);

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

async function enableQuickLink() {
  quicklink.listen();
}

async function addKeybinds() {
  const keyboardListener = (e: KeyboardEvent): void => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      document.querySelector<HTMLButtonElement>("#search-button")?.click();
    }
  };
  document.addEventListener("keydown", keyboardListener);
}

async function checkScreenshotMode() {
  if ("#og:image" === location.hash || "#og_image" === location.hash) {
    document.documentElement.setAttribute("data-screenshot-mode", "true");
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

let onReload = () => {};
const enablePrivateMode = memoizeOne(async () => {
  const a = document.querySelector<HTMLAnchorElement>("header a");
  if (a) {
    a.href = "HomePage";
    a.innerHTML +=
      ' <span class="ml-1 bg-red-400 text-black inline-block align-middle px-1 text-sm rounded font-bold uppercase">Private</span>';
  }

  window.addEventListener("keydown", async (e) => {
    if (e.key === "r") {
      onReload();
    }
  });
});

async function runDynamic(searchKey: string, options: { isPrivate: boolean }) {
  flashMessage("Loading notes contents...");
  const fetchContents = async () => {
    if (options.isPrivate) {
      enablePrivateMode();
      onReload = () => {
        runDynamic(searchKey, options);
      };
      return fetchPrivateNoteContents(searchKey);
    } else {
      return fetchPublicNoteContents(searchKey);
    }
  };
  const {
    source: contents,
    id: slug,
    compiled,
    compiled_source_version,
    source_version,
  } = await fetchContents();
  if (
    location.pathname !== `/${slug}` &&
    (location.pathname === `/${searchKey}` || location.pathname === `/`)
  ) {
    history.replaceState({}, "", `/${slug}`);
  }
  runDynamicBreadcrumb(slug);
  flashMessage("Loading compiler...");
  const params = new URLSearchParams(location.search);
  if (
    compiled &&
    compiled_source_version === source_version &&
    !params.get("recompile")
  ) {
    flashMessage("Running...");
    await runCompiled(JSON.parse(compiled));
    flashMessage("");
    return;
  }
  const { compileMarkdown } = await getCompiler();
  Object.assign(window, { compileMarkdown });
  flashMessage("Compiling...");
  const result = await compileMarkdown(contents, slug);
  flashMessage("Running...");
  await runCompiled(result.compiled);
  flashMessage("");
}

async function runDynamicBreadcrumb(slug: string) {
  const tree = await fetchTree();
  const items = generateBreadcrumbItems(tree, slug);
  const html = generateBreadcrumbHtml(items);
  const placeholder = document.querySelector("breadcrumb-placeholder");
  if (placeholder) {
    placeholder.outerHTML = html;
  }
}

async function runMain() {
  const precompilation = window as unknown as {
    precompiledNoteBehavior?: Function;
    precompiledFrontMatter?: Record<string, any>;
  };
  if (precompilation.precompiledNoteBehavior) {
    await runPrecompiled(
      precompilation.precompiledNoteBehavior,
      precompilation.precompiledFrontMatter || {}
    );
  } else {
    const pathname = location.pathname;
    const match = pathname.match(/^\/(private\/)?([A-Za-z0-9]+)$/);
    if (match) {
      await runDynamic(match[2], { isPrivate: !!match[1] });
    } else {
      await runDynamic("HomePage", { isPrivate: false });
    }
  }
}

async function runCompiled(compiled: CompiledNote) {
  document.querySelector("#mainContents")!.innerHTML = wrapHtml(compiled.html);

  const noteStyles = document.querySelector("#note-styles");
  if (noteStyles) {
    noteStyles.remove();
  }
  const newNoteStyles = document.createElement("style");
  newNoteStyles.id = "note-styles";
  newNoteStyles.innerHTML = compiled.css;
  document.head.appendChild(newNoteStyles);

  const oldTags = document.querySelectorAll("head [data-source='note']");
  for (const tag of oldTags) {
    tag.remove();
  }
  for (const [tag, attributes] of compiled.head) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    element.dataset.source = "note";
    document.head.appendChild(element);
  }

  document.title = processTitle(compiled.title);
  for (const [key, value] of Object.entries(compiled.dataset)) {
    document.documentElement.dataset[key] = value;
  }
  console.log(
    'This note has been dynamically compiled. To inspect the compiled code, open the console and type "compiled".'
  );
  Object.assign(window, { compiled });
  handleFrontMatter(compiled.frontMatter);
  const { hydrate } = await import("./runtime/vue3");
  hydrate(compiled.js, "#noteContents");
}

async function runPrecompiled(
  precompiledNoteBehavior: Function,
  frontMatter: Record<string, any>
) {
  handleFrontMatter(frontMatter);
  const { hydrate } = await import("./runtime/vue3");
  hydrate(precompiledNoteBehavior, "#noteContents");
}

async function handleFrontMatter(frontMatter: Record<string, any>) {
  console.log("Front matter:", frontMatter);
  const mainContents = document.querySelector<HTMLDivElement>("#mainContents");
  const footer = document.createElement("note-footer");
  footer.setAttribute("front-matter", JSON.stringify(frontMatter));
  mainContents?.appendChild(footer);
}

main();
