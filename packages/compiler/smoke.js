import { compileMarkdown } from "./dist/compiler/index.js";

console.log(await compileMarkdown("# hi", "Test"));
