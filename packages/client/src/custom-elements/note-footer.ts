class NoteFooter extends HTMLElement {
  constructor() {
    super();
  }

  frontMatter: Record<string, any> = {};

  giscusHandler = (event: MessageEvent) => {
    if (event.origin !== "https://giscus.app") return;
    if (!(typeof event.data === "object" && event.data.giscus)) return;
    const giscusData = event.data.giscus;
    if (giscusData.discussion) {
      const link = document.querySelector<HTMLAnchorElement>(
        'a[href="javascript:showGiscus()"]'
      );
      if (link) {
        link.href = giscusData.discussion.url;
        link.addEventListener("click", (e) => {
          if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
          e.preventDefault();
          this.showGiscus();
        });
      }
    }
  };

  get shouldUseGiscus() {
    // if (this.frontMatter.topic) {
    return !!this.frontMatter.giscus;
    // } else {
    //   return this.frontMatter.giscus !== false;
    // }
  }

  connectedCallback() {
    this.frontMatter = JSON.parse(
      this.getAttribute("front-matter") || "{}"
    ) as Record<string, any>;

    this.render();

    // Load Giscus
    if (!document.getElementById("giscus-script") && this.shouldUseGiscus) {
      const giscusScript = document.createElement("script");
      giscusScript.id = "giscus-script";
      giscusScript.src = "https://cdn.jsdelivr.net/npm/giscus@1.6.0/+esm";
      giscusScript.async = true;
      giscusScript.type = "module";
      document.head.appendChild(giscusScript);

      // Add <meta name="giscus:backlink" content="https://bit.ly/RickRolled">
      const giscusMeta = document.createElement("meta");
      giscusMeta.name = "giscus:backlink";
      giscusMeta.content =
        "https://dt.in.th/" + (this.getAttribute("slug") || "");
      document.head.appendChild(giscusMeta);

      Object.assign(window, {
        showGiscus: () => this.showGiscus(),
      });
    }
    window.addEventListener("message", this.giscusHandler);
  }

  showGiscus() {
    const widget = document.querySelector("#giscus-widget");
    if (!widget) return;
    widget.classList.toggle("hidden");
    if (!widget.classList.contains("hidden")) {
      requestAnimationFrame(() => {
        widget.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  disconnectedCallback() {
    window.removeEventListener("message", this.giscusHandler);
    Object.assign(window, {
      showGiscus: undefined,
    });
  }

  render() {
    const frontMatter = this.frontMatter;
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
    if (this.shouldUseGiscus) {
      discussions.push({
        url: "javascript:showGiscus()",
        title: "GitHub",
        icon: "fa-brands:github",
      });
    }
    if (discussions.length) {
      body += `<div class="flex gap-2 items-center relative top-[-2px]">
        <span>Respond on</span>
        ${discussions
          .map((discussion) => {
            return `<a href="${discussion.url}" title="${discussion.title}" class="text-2xl flex hover:text-[#ffffbb]">
              <iconify-icon icon="${discussion.icon}"></iconify-icon>
            </a>`;
          })
          .join("")}
      </div>`;
    }
    if (this.shouldUseGiscus) {
      body += `<giscus-widget
        id="giscus-widget"
        class="hidden"
        repo="dtinth/dt.in.th"
        repoid="MDEwOlJlcG9zaXRvcnkzMTg4NzI2MzY="
        category="Comments"
        categoryid="DIC_kwDOEwGcPM4CzYZX"
        mapping="specific"
        term="${this.getAttribute("slug") || ""}"
        reactionsenabled="1"
        emitmetadata="1"
        inputposition="bottom"
        theme="dark"
        lang="en"
      ></giscus-widget>`;
    }
    this.innerHTML = `<div class="text-[#8b8685]">${body}</div>`;
  }
}

customElements.define("note-footer", NoteFooter);
