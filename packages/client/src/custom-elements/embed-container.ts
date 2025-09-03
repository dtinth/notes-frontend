class EmbedContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.style.setProperty(
      "--aspect-ratio",
      this.getAttribute("aspect-ratio") || "16/9"
    );
    this.shadowRoot!.innerHTML = `
      <style>
        .embed-container {
          position: relative;
          background: #252423;
          overflow: hidden;
          border: 1px solid #656463;
          box-shadow: 2px 2px 0 #00000040;
        }
      </style>
      <div class="embed-container">
        <div style="aspect-ratio: var(--aspect-ratio);">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define("embed-container", EmbedContainer);
