import { expect, test } from "vitest";
import { compileMarkdown } from ".";

const FIXTURE1 = `---
x:
  y:
    z: 99
---
# hello

this is some text

\`\`\`js
const x = "hello"
\`\`\`

[link {{x}}](link)

<script setup>
import { ref } from 'vue';
const x = ref(1);
</script>

<style scoped>a { color: green }</style>

## section 1

<span class="bg-red-400">nice</span>

## section 2

very nice
`;

test("pre-renders the Vue component", async () => {
  const { compiled } = await compileMarkdown(FIXTURE1);
  expect(compiled.html).toContain("link 1");
});

test("supports scoped styles", async () => {
  const { compiled } = await compileMarkdown(FIXTURE1);
  expect(compiled.css).toContain("a[data-v");
});

test("supports frontmatter", async () => {
  const { frontMatter } = await compileMarkdown(FIXTURE1);
  expect(frontMatter.x.y.z).toEqual(99);
});

test("renders syntax highlighting", async () => {
  const { compiled } = await compileMarkdown(FIXTURE1);
  expect(compiled.html).toContain("shiki");
});

test("supports tailwind css classes", async () => {
  const { compiled } = await compileMarkdown(FIXTURE1);
  expect(compiled.css).toContain(".bg-red-400");
});
