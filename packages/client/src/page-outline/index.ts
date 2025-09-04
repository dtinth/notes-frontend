import { createApp } from "vue";
import PageOutline from "./PageOutline.vue";

let app: ReturnType<typeof createApp> | null = null;

export function initPageOutline() {
  // Don't initialize twice
  if (app) return;

  // Create a container for the Vue app
  const container = document.createElement("div");
  container.id = "page-outline-container";
  container.className = "h-0 sticky top-0 z-10";

  // Insert before the h-entry element
  const hEntry = document.querySelector(".h-entry");
  if (hEntry && hEntry.parentNode) {
    hEntry.parentNode.insertBefore(container, hEntry);
  } else {
    // Fallback to body if .h-entry not found
    document.body.appendChild(container);
  }

  // Create and mount the Vue app
  app = createApp(PageOutline, {
    targetId: "noteContents",
  });
  app.mount("#page-outline-container");
}

export function destroyPageOutline() {
  if (app) {
    app.unmount();
    app = null;

    const container = document.getElementById("page-outline-container");
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
