class NotesPageFooter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `<p><a href="/" title="Back to notes.dt.in.th">—</a><a class="p-author h-card" href="https://dt.in.th" title="Back to main website"><img src="/icon.png" alt="" style="display:none">@dtinth</a></p>`;
  }
}

customElements.define("notes-page-footer", NotesPageFooter);
