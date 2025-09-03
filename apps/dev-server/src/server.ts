import fastifyStatic from "@fastify/static";
import { generateHtml } from "@notes/html-generator";
import Fastify from "fastify";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({ logger: true });

fastify.register(fastifyStatic, {
  root: path.resolve(__dirname, "../../../packages/client/dist/runtime"),
  prefix: "/runtime/",
  decorateReply: false,
});

fastify.register(fastifyStatic, {
  root: path.resolve(__dirname, "../../../packages/compiler/dist/compiler"),
  prefix: "/compiler/",
  decorateReply: false,
});

fastify.get("*", async (request, reply) => {
  // Reply with HTML
  reply.type("text/html").send(generateHtml());
});

try {
  await fastify.listen({ port: 20242 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
