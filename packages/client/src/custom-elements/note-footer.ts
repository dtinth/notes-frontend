class NoteFooter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const frontMatter = JSON.parse(
      this.getAttribute("front-matter") || "{}"
    ) as Record<string, any>;
    let body = "";
    const discussions: { url: string; title: string; icon: string }[] = [];
    if (frontMatter.facebook) {
      discussions.push({
        url: frontMatter.facebook,
        title: "Facebook",
        icon: "bi:facebook",
      });
    }
    if (frontMatter.devto) {
      discussions.push({
        url: frontMatter.devto,
        title: "DEV Community",
        icon: "fa-brands:dev",
      });
    }
    if (frontMatter.twitter) {
      discussions.push({
        url: frontMatter.twitter,
        title: "Twitter",
        icon: "pajamas:twitter",
      });
    }
    if (frontMatter.reddit) {
      discussions.push({
        url: frontMatter.reddit,
        title: "Reddit",
        icon: "fa-brands:reddit",
      });
    }
    if (discussions.length) {
      body += `<div class="flex gap-2 items-center mt-8">
        <span>Respond on</span>
        ${discussions
          .map((discussion) => {
            return `<a href="${discussion.url}" title="${discussion.title}" class="text-2xl flex hover:text-#ffffbb">
              <iconify-icon icon="${discussion.icon}"></iconify-icon>
            </a>`;
          })
          .join("")}
      </div>`;
    }
    this.innerHTML = `<div class="text-#8b8685">${body}</div>`;
  }
}

customElements.define("note-footer", NoteFooter);
