import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import matter from "gray-matter";
import { micromark } from "micromark";
import { directive, directiveHtml } from "micromark-extension-directive";
import { gfmFootnote, gfmFootnoteHtml } from "micromark-extension-gfm-footnote";
import {
  gfmStrikethrough,
  gfmStrikethroughHtml,
} from "micromark-extension-gfm-strikethrough";
import { gfmTable, gfmTableHtml } from "micromark-extension-gfm-table";
import { rehype } from "rehype";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeVueSFC from "rehype-vue-sfc";
import { createHighligher } from "./shiki";

export async function markdownToVue(
  text: string,
  log: (message: string) => void = () => {}
): Promise<MarkdownToVueResult> {
  log("markdownToVue started");
  const { content: markdown, data: frontMatter } = matter(text);
  log("matter extracted");

  const result = micromark(markdown, {
    allowDangerousHtml: true,
    extensions: [
      gfmFootnote(),
      gfmStrikethrough({ singleTilde: true }),
      gfmTable(),
      directive(),
    ],
    htmlExtensions: [
      gfmFootnoteHtml(),
      gfmStrikethroughHtml(),
      gfmTableHtml(),
      directiveHtml({
        lead: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag('<div class="lead">');
          if (directive.content) this.raw(directive.content);
          this.tag("</div>");
          return true;
        },
        split: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag("<d-split>");
          if (directive.content) this.raw(directive.content);
          this.tag("</d-split>");
          return true;
        },
        aside: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag('<div slot="right">');
          if (directive.content) this.raw(directive.content);
          this.tag("</div>");
          return true;
        },
        "*": function (directive) {
          if (directive.content) {
            this.raw(directive.content);
          }
          return true;
        },
      }),
    ],
  });
  log("micromark processed");

  const processor = rehype()
    .data("settings", { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeShikiFromHighlighter, (await createHighligher()) as any, {
      theme: "github-dark",
      colorReplacements: {
        "#24292e": "#252423",
      },
    })
    .use(rehypeVueSFC);
  const processed = await processor.process(result);
  log("rehype processed");

  return {
    vueTemplate: processed.toString(),
    frontMatter,
  };
}

interface MarkdownToVueResult {
  vueTemplate: string;
  frontMatter: Record<string, any>;
}
