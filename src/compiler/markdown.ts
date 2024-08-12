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
import rehypeShiki from "@shikijs/rehype";

export async function markdownToVue(
  text: string
): Promise<MarkdownToVueResult> {
  const { content: markdown, data: frontMatter } = matter(text);
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
      directiveHtml({}),
    ],
  });

  const processor = rehype()
    .data("settings", { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeShiki, {
      theme: "vitesse-dark",
    })
    .use(rehypeVueSFC);
  const processed = await processor.process(result);

  return {
    vueTemplate: processed.toString(),
    frontMatter,
  };
}

interface MarkdownToVueResult {
  vueTemplate: string;
  frontMatter: Record<string, any>;
}
