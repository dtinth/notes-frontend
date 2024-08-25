import "@fontsource/arimo/400.css";
import "@fontsource/arimo/500.css";
import "@fontsource/arimo/600.css";
import "@fontsource/arimo/700.css";
import "comic-mono/index.css";
import { ofetch } from "ofetch";
import "./style.css";

const prose =
  "prose prose-invert tracking-[.01em] max-w-none prose-h1:text-#8b8685 prose-h1:[text-shadow:2px_2px_#00000040] prose-h2:text-#d7fc70 prose-h2:[text-shadow:2px_2px_#d7fc7026] prose-th:uppercase prose-th:font-normal prose-th:text-xs prose-th:text-#8b8685 prose-thead:border-#656463 prose-tr:border-#454443 prose-a:text-#ffffbb";

async function main() {
  if (location.pathname === "/preview") {
    return runPreviewer();
  } else {
    return runNormal();
  }
}

async function runPreviewer() {
  showStatus("Loading compiler...");
  const { compileMarkdown } = await import("./compiler-web");
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
  const { compileMarkdown } = await import("./compiler-web");
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
  <div class="${prose}">
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
    <div class="${prose}" id="noteContents">${compiled.html}</div>
  `;
  console.log(
    'This note has been dynamically compiled. To inspect the compiled code, open the console and type "compiled".'
  );
  Object.assign(window, { compiled });
  const { hydrate } = await import("./runtime/vue3");
  hydrate(compiled.js, "#noteContents");
}

main();
