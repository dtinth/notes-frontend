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
  cacheControl: false,
});

fastify.register(fastifyStatic, {
  root: path.resolve(__dirname, "../../../packages/client/dist/static"),
  prefix: "/static/",
  decorateReply: false,
  cacheControl: false,
});

fastify.register(fastifyStatic, {
  root: path.resolve(__dirname, "../../../packages/compiler/dist/compiler"),
  prefix: "/compiler/",
  decorateReply: false,
  cacheControl: false,
});

fastify.get("*", async (request, reply) => {
  const slug = request.url.match(/^\/([\w\-\/]*)/)?.[1] || "HomePage";
  if ((request.query as { compile?: string }).compile) {
    const url =
      "https://htrqhjrmmqrqaccchyne.supabase.co/rest/v1/rpc/notes_get_contents?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnFoanJtbXFycWFjY2NoeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxOTk3NDIsImV4cCI6MTk3NDc3NTc0Mn0.VEdURpInV9dowpoMkHopAzpiBtNnRXDgO6hRfy1ZSHY";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input_search_key: slug.toLowerCase(),
      }),
    });
    if (!response.ok) {
      reply.code(500).send("Error fetching data");
      console.error("Unable to fetch", await response.text());
      return;
    }
    const data = (await response.json()) as { compiled: string; id: string }[];
    if (!data || data.length === 0) {
      return reply.code(404).send("No content found");
    }
    const precompiled = JSON.parse(data[0].compiled);
    return reply.type("text/html").send(
      generateHtml({
        compiled: precompiled,
        slug: data[0].id,
      })
    );
  }

  // Reply with HTML
  reply.type("text/html").send(generateHtml());
});

try {
  await fastify.listen({ port: 20242 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
