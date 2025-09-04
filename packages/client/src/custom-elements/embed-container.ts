class EmbedContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const height = this.getAttribute("height");
    const aspectRatio = this.getAttribute("aspect-ratio") || "16/9";

    this.style.setProperty("--aspect-ratio", aspectRatio);
    if (height) {
      this.style.setProperty("--height", height);
    }

    const sizingType = height ? "height" : "aspect";

    this.shadowRoot!.innerHTML = `
      <style>
        .embed-container {
          position: relative;
          background: #252423;
          overflow: hidden;
          border: 1px solid #656463;
          box-shadow: 2px 2px 0 #00000040;
        }
        .embed-container > div[data-sizing="aspect"] {
          aspect-ratio: var(--aspect-ratio);
        }
        .embed-container > div[data-sizing="height"] {
          height: var(--height);
        }
      </style>
      <div class="embed-container">
        <div data-sizing="${sizingType}">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define("embed-container", EmbedContainer);
