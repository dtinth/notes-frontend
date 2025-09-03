<template>
  <div class="text-[#8b8685] font-semibold mb-2">On this page</div>
  <nav>
    <ul class="flex flex-col text-sm">
      <li 
        v-for="heading in headings" 
        :key="heading.id"
        :class="`page-outline-item level-${heading.level} ${heading.level > 2 ? 'ml-3' : ''}`"
      >
        <a 
          :href="`#${heading.id}`" 
          class="block hover:text-[#ffffbb] transition-colors py-1"
          @click="onHeadingClick(heading.id)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface Heading {
  level: number;
  id: string;
  text: string;
}

const props = defineProps<{
  headings: Heading[];
}>();

const emit = defineEmits<{
  (e: 'headingClick', id: string): void;
}>();

const onHeadingClick = (id: string) => {
  emit('headingClick', id);
};
</script>