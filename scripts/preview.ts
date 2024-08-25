import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import { readFileSync } from "fs";
import escape from "lodash-es/escape";
import path from "path";
import { fileURLToPath } from "url";
import { fetchPublicNoteContents } from "../src/io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = fastify({ logger: true });
const root = path.join(__dirname, "..", "dist");

server.register(fastifyStatic, {
  root,
});

server.setNotFoundHandler((request, reply) => {
  const fileSender = reply as unknown as { sendFile: (path: string) => void };
  fileSender.sendFile("index.html");
});

server.get("/:slug", async (request, reply) => {
  const template = readFileSync(path.join(root, "index.html"), "utf8");
  const slug = ((request.params || {}) as { slug: string }).slug || "HomePage";
  const contents = await fetchPublicNoteContents(slug);
  const compilerPath = "../public/lib/compiler/index.js";
  const compiler = (await import(
    compilerPath
  )) as typeof import("../src/compiler");
  const result = await compiler.compileMarkdown(contents, slug);
  const { compiled } = result;
  // console.log(result);
  let html = template;

  let dataAttributes = " data-precompiled=true";
  for (const [key, value] of Object.entries(compiled.dataset)) {
    dataAttributes += ` data-${key}="${escape(value)}"`;
  }

  html = html.replace(/<html/, () => `<html` + dataAttributes);
  html = html.replace(
    /<script id="head-placeholder"[^]*?<\/script>/,
    () =>
      `<title>${escape(compiled.title)}</title>` +
      (!compiled.css || compiled.css === "/* No <style> tags present */"
        ? ""
        : `<style>${compiled.css}</style>`)
  );
  html = html.replace(
    /<script id="js-placeholder"[^]*?<\/script>/,
    () =>
      `<script>window.precompiledNoteBehavior = function(require, exports, module, Vue) {${compiled.js}}</script>`
  );
  html = html.replace(
    /<content-placeholder>([^]*?)<\/content-placeholder>/,
    () => `<div class="prose" id="noteContents">${compiled.html}</div>`
  );

  reply.type("text/html").send(html);
});

const start = async () => {
  try {
    await server.listen({ port: 20242 });
    console.log("Server listening on http://localhost:20242");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
