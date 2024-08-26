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
