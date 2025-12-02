export class CopyButton extends HTMLElement {
  private button: HTMLButtonElement | null = null;

  connectedCallback() {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", "Copy code");
    button.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

    button.addEventListener("click", this.handleCopy.bind(this));
    this.appendChild(button);
    this.button = button;
  }

  private async handleCopy() {
    // Navigate up the DOM using closest
    const upSelector = this.getAttribute("up");
    const downSelector = this.getAttribute("down");

    let codeElement: HTMLElement | null = null;

    if (upSelector) {
      const parent = this.closest(upSelector);
      if (downSelector && parent) {
        codeElement = parent.querySelector(downSelector) as HTMLElement;
      } else {
        codeElement = parent as HTMLElement;
      }
    } else if (downSelector) {
      codeElement = this.querySelector(downSelector) as HTMLElement;
    }

    if (!codeElement) {
      console.error("Could not find code element to copy");
      return;
    }

    const code = codeElement.textContent || "";

    try {
      await navigator.clipboard.writeText(code);
      this.showCopiedFeedback();
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }

  private showCopiedFeedback() {
    if (!this.button) return;

    const originalHTML = this.button.innerHTML;
    this.button.classList.add("copied");
    this.button.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => {
      if (!this.button) return;
      this.button.classList.remove("copied");
      this.button.innerHTML = originalHTML;
    }, 2000);
  }
}

customElements.define("copy-button", CopyButton);
