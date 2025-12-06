import { NoteRuntimeContext } from "./types";
import { initUpdateHistory } from "./update-history";

export async function onHydrated(runtimeContext: NoteRuntimeContext) {
  initLittlefoot();
  initImageZoom();
  initCodeBlockCopyButton();
  initUpdateHistory(runtimeContext);
}

async function initLittlefoot() {
  const { littlefoot } = await import("littlefoot");
  littlefoot({
    scope: "#noteContents",
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
}

// Initialize medium-zoom for images inside the rendered note contents.
// This is called after the note HTML is injected and hydrated so images exist in the DOM.
async function initImageZoom() {
  const { default: mediumZoom } = await import("medium-zoom");
  const container = document.querySelector<HTMLElement>("#noteContents");
  if (!container) return;
  const imgs = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
  if (imgs.length === 0) return;

  // Initialize medium-zoom on all images inside the note container.
  // medium-zoom will use `data-zoom-src` automatically if present.
  mediumZoom(imgs, {
    background: "rgba(0,0,0,0.9)",
    margin: 24,
    scrollOffset: 40,
  });
}

// Add copy button to code blocks
function initCodeBlockCopyButton() {
  const container = document.querySelector<HTMLElement>("#noteContents");
  if (!container) return;

  const preElements = container.querySelectorAll<HTMLPreElement>("pre.shiki");
  preElements.forEach((pre) => {
    // Create custom copy button element
    const button = document.createElement("copy-button") as HTMLElement;
    // Navigate up to pre, then down to code element
    button.setAttribute("up", "pre.shiki");
    button.setAttribute("down", "code");

    // Add button to pre element
    pre.style.position = "relative";
    pre.classList.add("copy-button-parent");
    pre.appendChild(button);
  });
}
