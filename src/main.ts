import "./style.css";

const prose =
  "prose prose-invert max-w-none prose-h1:text-#bbeeff prose-h1:[text-shadow:2px_2px_#00000040] prose-h2:text-#d7fc70 prose-h2:[text-shadow:2px_2px_#d7fc7026] prose-th:uppercase prose-th:font-normal prose-th:text-xs prose-th:text-#8b8685 prose-thead:border-#656463 prose-tr:border-#454443 prose-a:text-#ffffbb";

document.querySelector("#mainContents")!.innerHTML = `
<div class="${prose}">
  <h1>notes.dt.in.th</h1>
  <div class="notes-lead">
    nyan
  </div>
  <p>My page is a simple page.</p>
  <h2>Topics</h2>
</div>
`;

fetch("/test.json")
  .then((r) => r.json())
  .then(async (v) => {
    document.querySelector("#mainContents")!.innerHTML = `
      <style>${v.css}</style>
      <div class="${prose}" id="noteContents">${v.html}</div>
    `;

    const Vue = await import("vue");
    // import { executeCjs } from "./runtime/vue3";
    const { executeCjs } = await import("./runtime/vue3");
    const Component = executeCjs(v.js, {}).default;
    console.log(Component);
    // Hydrate
    const app = Vue.createSSRApp(Component);
    app.mount("#noteContents");
  });
