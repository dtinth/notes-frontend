import { NoteRuntimeContext } from "../types";

type UpdateEntry = { date: string; description?: string };
let script: HTMLScriptElement | null = null;

export function initUpdateHistory(runtimeContext: NoteRuntimeContext) {
  if (!script) {
    script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@github/relative-time-element@4.5.1/dist/bundle.min.js";
    script.async = true;
    script.type = "module";
    document.head.appendChild(script);
  }
  const { frontMatter } = runtimeContext;
  const created = formatDateISO(frontMatter.created);
  const updates: UpdateEntry[] = [
    ...(created
      ? [{ date: formatDateISO(created), description: "Initial publication" }]
      : []),
    ...(frontMatter.updates || []).map(
      (u: { date: string; description?: string }): UpdateEntry => ({
        date: formatDateISO(u.date),
        description: u.description,
      })
    ),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const updated =
    updates.length > 1
      ? updates[0].date
      : frontMatter.updated
      ? formatDateISO(frontMatter.updated)
      : undefined;
  if (created || updated) {
    const hasMultipleUpdates = updates.length > 1;
    const dateInfo = document.createElement(
      hasMultipleUpdates ? "button" : "div"
    );
    dateInfo.className =
      "absolute top-[76px] text-[10px] text-[#8b8685] mt-2 border border-[#656463] px-0.75 uppercase " +
      (hasMultipleUpdates ? "cursor-pointer hover:bg-[#454443]" : "");
    if (updated) {
      dateInfo.innerHTML = `Last updated ${formatRelativeTimeHtml(updated)}`;
    } else {
      dateInfo.innerHTML = `Published ${formatRelativeTimeHtml(created)}`;
    }
    dateInfo.title = updated || created;
    const mainContents =
      document.querySelector<HTMLDivElement>("#mainContents");
    if (mainContents) {
      mainContents.appendChild(dateInfo);
      if (hasMultipleUpdates) {
        const updateList = createUpdateList(updates);
        updateList.hidden = true;
        dateInfo.addEventListener("click", () => {
          mainContents.insertBefore(updateList, mainContents.firstChild);
          updateList.hidden = !updateList.hidden;
          if (!updateList.hidden) {
            updateList.focus();
          }
        });
        const closeButton = updateList.querySelector<HTMLButtonElement>(
          ".js-close-update-history"
        );
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            updateList.hidden = true;
            dateInfo.focus();
          });
        }
      }
    }
  }
}

function createUpdateList(updates: UpdateEntry[]) {
  const div = document.createElement("div");
  div.tabIndex = 0;
  div.className =
    "bg-[#252423] px-3 pt-6 pb-2 mb-6 mt-[-22px] border border-[#656463] [box-shadow:2px_2px_#00000040] prose relative -mx-3 md:mx-0";
  div.innerHTML = `<strong class="text-[#d7fc70]">Update History</strong>
  <button class="js-close-update-history absolute top-[1px] right-2 text-[#8b8685] hover:text-white cursor-pointer" aria-label="Close update history">✕</button>
  <table class="mt-2 text-sm md:text-base">
    <thead>
      <tr>
        <th class="text-left pb-1">Date</th>
        <th class="text-left pb-1">Description</th>
      </tr>
    </thead>
    <tbody>
      ${updates
        .map((update) => {
          return `<tr>
            <td class="align-top pr-4 w-[12ch] md:w-[12.5ch]">${
              update.date
            }</td>
            <td class="align-top">${update.description || ""}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>
  `;
  return div;
}

const formatDateISO = (dateString: string) => {
  return new Date(dateString).toISOString().split("T")[0];
};

const formatRelativeTimeHtml = (dateIso: string) => {
  return `<relative-time datetime="${dateIso}T00:00:00.000Z" precision="day" threshold="P100Y" no-title="">${formatDateISO(
    dateIso
  )}</relative-time>`;
};
