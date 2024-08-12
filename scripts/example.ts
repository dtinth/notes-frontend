import { readFileSync, writeFileSync } from "fs";
import { compileMarkdown } from "../lib/compiler";

const source = readFileSync("fixtures/interactivity.md", "utf8");
const result = await compileMarkdown(source);

writeFileSync("public/test.json", JSON.stringify(result, null, 2));
