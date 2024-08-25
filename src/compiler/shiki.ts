import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

import themesVitesseDark from "shiki/themes/vitesse-dark.mjs";
import { langs } from "./shikiLangs";

export const highlighter = await createHighlighterCore({
  themes: [themesVitesseDark],
  langs: langs,
  loadWasm: getWasm,
});
