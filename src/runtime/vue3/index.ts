import * as Vue from "vue";

export function executeCjs(cjs: string, moduleMap: Record<string, any>) {
  const require = (id: string) => {
    if (id === "vue") return Vue;
    if (moduleMap[id]) return moduleMap[id];
    throw new Error("[executeCjs] Unavailable module: " + id);
  };
  const exports = {};
  const module = { exports };
  const fn = new Function("require", "exports", "module", cjs);
  fn(require, exports, module);
  return module.exports as { default: Vue.Component };
}
