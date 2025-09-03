import * as Vue from "vue";

export function executeCjs(
  cjs: string | Function,
  moduleMap: Record<string, any>
) {
  const require = (id: string) => {
    if (id === "vue") return Vue;
    if (moduleMap[id]) return moduleMap[id];
    throw new Error("[executeCjs] Unavailable module: " + id);
  };
  const exports = {};
  const module = { exports };
  const fn =
    typeof cjs === "function"
      ? cjs
      : new Function("require", "exports", "module", "Vue", cjs);
  fn(require, exports, module, Vue);
  return module.exports as { default: Vue.Component };
}

export function hydrate(js: string | Function, target: string) {
  const Component = executeCjs(js, {}).default;
  const app = Vue.createSSRApp(Component);
  registerComponents(app);
  app
    .mount(target)
    .$nextTick()
    .then(async () => {
      const { littlefoot } = await import("littlefoot");
      littlefoot({
        scope: target,
        buttonTemplate: `<button
      aria-expanded="false"
      aria-label="Footnote <% number %>"
      class="littlefoot__button"
      id="<% reference %>"
      title="See Footnote <% number %>"
    />
      <% number %>
    </button>`,
      });
    });
}

export function registerComponents(app: Vue.App) {
  void app;
  // app.component()
}
