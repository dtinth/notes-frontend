export async function onHydrated() {
  initLittlefoot();
  initImageZoom();
  initCodeBlockCopyButton();
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
    // Create copy button
    const button = document.createElement("button");
    button.className = "code-copy-button";
    button.setAttribute("type", "button");
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

    // Add click handler
    button.addEventListener("click", async () => {
      const code = pre.textContent || "";
      try {
        await navigator.clipboard.writeText(code);
        // Show feedback
        const originalHTML = button.innerHTML;
        button.classList.add("copied");
        button.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => {
          button.classList.remove("copied");
          button.innerHTML = originalHTML;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    });

    // Add button to pre element
    pre.style.position = "relative";
    pre.appendChild(button);
  });
}
