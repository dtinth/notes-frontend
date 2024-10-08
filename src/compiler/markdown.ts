import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import matter from "gray-matter";
import { micromark } from "micromark";
import {
  directive,
  directiveHtml,
  Handle,
} from "micromark-extension-directive";
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
import { getHighlighter } from "./shiki";

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
        me: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag(`<div class="notes-bubble" data-author-position="right">`);
          this.tag(
            `<div class="notes-bubble__author"><span class="notes-bubble__me">Me:</span></div>`
          );
          this.tag(`<div class="notes-bubble__message">`);
          if (directive.content) this.raw(directive.content);
          this.tag(`</div>`);
          this.tag(`</div>`);
          return true;
        },
        thought: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag(`<div class="notes-bubble" data-author-position="right">`);
          this.tag(`<div class="notes-bubble__message">`);
          if (directive.content) this.raw(directive.content);
          this.tag(`</div>`);
          this.tag(`</div>`);
          return true;
        },
        bubble: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag(`<div class="notes-bubble" data-author-position="left">`);
          this.tag(
            `<div class="notes-bubble__author"><notes-bubble-author author="${directive.label}"></notes-bubble-author></div>`
          );
          this.tag(`<div class="notes-bubble__message">`);
          if (directive.content) this.raw(directive.content);
          this.tag(`</div>`);
          this.tag(`</div>`);
          return true;
        },
        youtube: function (directive) {
          if (directive.type !== "leafDirective") return false;
          this.tag(
            `<youtube-embed video-id="${directive.label}"></youtube-embed>`
          );
          return true;
        },
        cta: function (directive) {
          if (directive.type !== "leafDirective") return false;
          this.tag('<p class="notes-cta">');
          this.tag(
            `<a class="notes-cta__link" href="${directive.attributes?.href}">`
          );
          this.tag('<span class="notes-cta__title">');
          this.raw(directive.label || "");
          this.tag("</span>");
          this.tag('<span class="notes-cta__url">');
          this.raw(directive.attributes?.href || "");
          this.tag("</span>");
          this.tag("</a>");
          this.tag("</p>");
          return true;
        },
        note: createCallout("Note"),
        success: createCallout("Success"),
        info: createCallout("Info"),
        tip: createCallout("Tip"),
        important: createCallout("Important"),
        warning: createCallout("Warning"),
        caution: createCallout("Caution"),
        danger: createCallout("Danger"),
        details: function (directive) {
          if (directive.type !== "containerDirective") return false;
          this.tag("<details>");
          this.tag(`<summary>`);
          this.raw(directive.label || "Details");
          this.tag("</summary>");
          if (directive.content) this.raw(directive.content);
          this.tag("</details>");
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
    .use(rehypeShikiFromHighlighter, (await getHighlighter()) as any, {
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

function createCallout(type: string): Handle {
  return function (directive) {
    if (directive.type !== "containerDirective") return false;
    this.tag(`<div class="notes-callout" data-type="${type}">`);
    this.tag(`<p class="notes-callout__label">`);
    this.tag(`<notes-callout-icon type="${type}"></notes-callout-icon>`);
    this.raw(directive.label || type);
    this.tag(`</p>`);
    if (directive.content) this.raw(directive.content);
    this.tag("</div>");
    return true;
  };
}
