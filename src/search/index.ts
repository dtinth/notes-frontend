import { App, createApp } from "vue";
import SearchDialog from "./SearchDialog.vue";
import { open } from "./state";

let app: App | undefined;

export function openSearch() {
  if (!app) {
    app = createApp(SearchDialog);
    const root = document.createElement("div");
    document.body.appendChild(root);
    app.mount(root);
  }
  open.value = true;
}
