import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

import themesGitHubDark from "shiki/themes/github-dark.mjs";
import { langs } from "./shikiLangs";

export const createHighligher = () =>
  createHighlighterCore({
    themes: [themesGitHubDark],
    langs: langs,
    loadWasm: getWasm,
  });
