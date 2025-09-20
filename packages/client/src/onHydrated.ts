export async function onHydrated() {
  initLittlefoot();
  initImageZoom();
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
