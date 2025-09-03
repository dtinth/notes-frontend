class DSplit extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot!.innerHTML = `
      <style>
        @media (min-width: 840px) {
          :host {
            display: flex;
            gap: 2rem;
          }
          .left {
            flex: auto;
          }
          .right {
            flex: none;
            width: 400px;
            min-width: 45%;
          }
        }
      </style>
      <div class="left">
        <slot></slot>
      </div>
      <div class="right">
        <slot name="right"></slot>
      </div>
    `;
  }
}

customElements.define("d-split", DSplit);
