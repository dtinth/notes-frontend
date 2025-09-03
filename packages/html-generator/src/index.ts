import escape from "lodash-es/escape";

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

export function generateHtml() {
  return `<!DOCTYPE html>
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
    <header>
      <div id="headerLeft">
        <a
          class="flex items-center text-#8b8685 hover:text-#ffffbb text-lg"
          href="/"
          >notes.dt.in.th</a
        >
      </div>
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
  </body>
</html>`;
}
