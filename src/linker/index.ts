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
