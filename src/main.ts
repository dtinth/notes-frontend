import "./style.css";

const prose =
  "prose prose-invert max-w-none prose-h1:text-#bbeeff prose-h1:[text-shadow:2px_2px_#00000040] prose-h2:text-#d7fc70 prose-h2:[text-shadow:2px_2px_#d7fc7026] prose-th:uppercase prose-th:font-normal prose-th:text-xs prose-th:text-#8b8685 prose-thead:border-#656463 prose-tr:border-#454443 prose-a:text-#ffffbb";

async function main() {
  if (location.pathname === "/preview") {
    return runPreviewer();
  } else {
    return runNormal();
  }
}

async function runPreviewer() {
  showStatus("Loading compiler...");
  const { compileMarkdown } = await import("./compiler");
  Object.assign(window, { compileMarkdown });
  showStatus("Compiling...");
  const result = await compileMarkdown("whee!");
  console.log(result);
  await runCompiled(result.compiled);
}

async function runNormal() {
  showStatus("Unimplemented");
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
  const { hydrate } = await import("./runtime/vue3");
  hydrate(compiled.js, "#noteContents");
}

main();
