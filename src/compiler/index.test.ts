import { expect, test } from "vitest";
import { compileMarkdown } from ".";

const FIXTURE1 = `---
x:
  y:
    z: 99
---
# hello

this is some text

[link {{x}}](link)

<script setup>
import { ref } from 'vue';
const x = ref(1);
</script>

<style scoped>a { color: green }</style>

## section 1

nice

## section 2

very nice
`;

test("pre-renders the Vue component", async () => {
  const result = await compileMarkdown(FIXTURE1);
  expect(result.html).toContain("link 1");
});

test("supports scoped styles", async () => {
  const result = await compileMarkdown(FIXTURE1);
  expect(result.css).toContain("a[data-v");
});

test("supports frontmatter", async () => {
  const result = await compileMarkdown(FIXTURE1);
  expect(result.frontMatter.x.y.z).toEqual(99);
});
