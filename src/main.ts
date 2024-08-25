import "@fontsource/arimo/400.css";
import "@fontsource/arimo/500.css";
import "@fontsource/arimo/600.css";
import "@fontsource/arimo/700.css";
import "comic-mono/index.css";
import { ofetch } from "ofetch";
import "./style.css";

async function main() {
  if (location.pathname === "/preview") {
    return runPreviewer();
  } else {
    return runNormal();
  }
}

async function getCompiler() {
  const { Buffer } = await import("buffer-es6");
  Object.assign(window, { Buffer, global: window, process: { env: {} } });
  return import(/* @vite-ignore */ location.origin + "/lib/compiler/index.js");
}

async function runPreviewer() {
  showStatus("Loading compiler...");
  const { compileMarkdown } = await getCompiler();
  Object.assign(window, { compileMarkdown });
  showStatus("Compiling...");
  const result = await compileMarkdown("whee!");
  console.log(result);
  await runCompiled(result.compiled);
}

async function fetchNoteContents(slug: string) {
  const data = await ofetch<{ contents: string }>(
    "https://htrqhjrmmqrqaccchyne.supabase.co/rest/v1/rpc/get_note_contents?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnFoanJtbXFycWFjY2NoeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxOTk3NDIsImV4cCI6MTk3NDc3NTc0Mn0.VEdURpInV9dowpoMkHopAzpiBtNnRXDgO6hRfy1ZSHY",
    { method: "POST", body: { note_id: slug } }
  );
  return data.contents;
}

async function runDynamic(slug: string) {
  showStatus("Loading notes contents...");
  const contents = await fetchNoteContents(slug);
  showStatus("Loading compiler...");
  const { compileMarkdown } = await getCompiler();
  Object.assign(window, { compileMarkdown });
  showStatus("Compiling...");
  const result = await compileMarkdown(contents);
  await runCompiled(result.compiled);
}

async function runNormal() {
  const pathname = location.pathname;
  const match = pathname.match(/^\/([A-Za-z0-9]+)$/);
  if (match) {
    await runDynamic(match[1]);
  } else {
    await runDynamic("HomePage");
  }
}

function showStatus(status: string) {
  document.querySelector("#mainContents")!.innerHTML = `
  <div class="prose">
    <h1>${status}</h1>
  </div>
  `;
}

async function runCompiled(compiled: {
  css: string;
  html: string;
  js: string;
}) {
  document.querySelector("#mainContents")!.innerHTML = `
    <style>${compiled.css}</style>
    <div class="prose" id="noteContents">${compiled.html}</div>
  `;
  console.log(
    'This note has been dynamically compiled. To inspect the compiled code, open the console and type "compiled".'
  );
  Object.assign(window, { compiled });
  const { hydrate } = await import("./runtime/vue3");
  hydrate(compiled.js, "#noteContents");
}

main();
