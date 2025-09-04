import type { CompiledNote, HeadElement } from "@notes/types";
import escape from "lodash-es/escape";
export type * from "@notes/types";

export function wrapHtml(html: string) {
  return `<div class="prose e-content" id="noteContents">${html}</div>`;
}

export function processTitle(title: string) {
  if (title === "notes.dt.in.th") {
    return title;
  } else {
    return `${title} | notes.dt.in.th`;
  }
}

export interface BreadcrumbItems {
  label: string;
  title: string;
  url: string;
}
export function generateBreadcrumbHtml(items: BreadcrumbItems[]) {
  const output: string[] = [];
  for (const item of items) {
    output.push(`<div class="px-2 flex-none">›</div>`);
    output.push(
      `<div class="truncate"><a title="${escape(item.title)}" href="${
        item.url
      }">${escape(item.label)}</a></div>`
    );
  }
  return output.join("");
}

export interface TreeNode {
  title: string;
  parent?: string;
}
export interface Tree {
  nodes: Record<string, TreeNode>;
}
export function generateBreadcrumbItems(
  tree: Tree,
  initialSlug: string
): BreadcrumbItems[] {
  const nodes = tree.nodes;
  const items: BreadcrumbItems[] = [];
  for (
    let id: string | undefined = nodes[initialSlug]?.parent;
    id && id !== "HomePage" && nodes[id];
    id = nodes[id].parent
  ) {
    const node = nodes[id];
    items.unshift({
      label: node.title.replace(/ \(topic\)$/, ""),
      title: node.title,
      url: id,
    });
  }
  return items;
}

export function generateHtml(precompiled?: PrecompiledInput) {
  let html = `<!DOCTYPE html>
<html lang="en" data-dtinth="true">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/static/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script id="head-placeholder" type="text/x-placeholder"></script>
    <script async src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js" integrity="sha256-dY2Ug42wyv3rl+sLVKEg3jbPs8f+hi7tmJ836AxVDwI=" crossorigin="anonymous"></script>
    <script async src="https://cdn.jsdelivr.net/npm/blurhash-image@1.0.1/blurhash-image.min.js" integrity="sha256-qrUUgTGk7xA7iVCwraHNQjwy2JryA0K4L3DL4qidagQ=" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/runtime/entry/index.css" />
  </head>
  <body>
    <header id="header">
      <div id="headerLeft"><a href="/">notes.dt.in.th</a></div>
    </header>
    <div class="h-entry">
      <main id="main">
        <div id="mainContents">
          <content-placeholder>Loading…</content-placeholder>
        </div>
      </main>
      <footer>
        <div id="footerContents">
          <notes-page-footer></notes-page-footer>
        </div>
      </footer>
    </div>
    <script id="js-placeholder" type="text/x-placeholder"></script>
    <script type="module" src="/runtime/entry/index.js"></script>
    <!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "09ed5abf1cf7485c9af5d066baedf2a9"}'></script><!-- End Cloudflare Web Analytics -->
  </body>
</html>`;
  if (precompiled) {
    html = applyTemplate(html, precompiled);
  }
  return html;
}

export interface PrecompiledInput {
  slug: string;
  compiled: CompiledNote;
}

function applyTemplate(template: string, input: PrecompiledInput) {
  const { compiled, slug } = input;
  let html = template;

  let dataAttributes = " data-precompiled=true";
  for (const [key, value] of Object.entries(compiled.dataset)) {
    dataAttributes += ` data-${key}="${escape(value)}"`;
  }

  html = html.replace(/<html/, () => `<html` + dataAttributes);
  html = html.replace(
    /<script id="head-placeholder"[^]*?<\/script>/,
    () =>
      `<title>${escape(processTitle(compiled.title))}</title>` +
      generateHead(compiled.head) +
      (!compiled.css || compiled.css === "/* No <style> tags present */"
        ? ""
        : `<style id="note-styles">${compiled.css}</style>`)
  );
  html = html.replace(
    /<script id="js-placeholder"[^]*?<\/script>/,
    () =>
      `<script>
window.precompiledNoteBehavior = function(require, exports, module, Vue) {${
        compiled.js
      }};
window.precompiledFrontMatter = ${JSON.stringify(compiled.frontMatter).replace(
        /</g,
        "\\u003c"
      )};
</script>`
  );
  html = html.replace(
    /<content-placeholder>([^]*?)<\/content-placeholder>/,
    () => wrapHtml(compiled.html)
  );
  return html;
}

function generateHead(headElements: HeadElement[]): string {
  return headElements
    .map((element) => {
      if (element.length === 2) {
        const [tag, attributes] = element;
        const attributeString = Object.entries(attributes)
          .map(([key, value]) => `${key}="${escape(value)}"`)
          .join(" ");
        return `<${tag} ${attributeString} data-source="note">`;
      } else if (element.length === 3) {
        const [tag, attributes, content] = element;
        const attributeString = Object.entries(attributes)
          .map(([key, value]) => `${key}="${escape(value)}"`)
          .join(" ");
        return `<${tag} ${attributeString} data-source="note">${content}</${tag}>`;
      }
      return "";
    })
    .join("\n");
}
