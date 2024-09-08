import memoizeOne from "async-memoize-one";
import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

import themesGitHubDark from "shiki/themes/github-dark.mjs";
import { langs } from "./shikiLangs";

export const getHighlighter = memoizeOne(() =>
  createHighlighterCore({
    themes: [themesGitHubDark],
    langs: langs,
    loadWasm: getWasm,
  })
);
