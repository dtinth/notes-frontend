<template>
  <template v-if="headings.length >= 2">
    <div v-if="displayMode === 'desktop'"
      class="page-outline-desktop fixed w-[190px] left-[calc(50%+var(--notes-content-width)/2+16px)] top-[106px] z-10 opacity-50 hover:opacity-100 transition-opacity duration-200">
      <HeadingList :headings="headings" @heading-click="scrollToHeading" />
    </div>

    <!-- Tab below navbar (for mobile) -->
    <div v-if="displayMode === 'mobile'" class="page-outline-mobile">
      <!-- Tab that sticks to top after scrolling past navbar -->
      <button
        class="page-outline-tab absolute top-0 right-4 bg-[#353433] border border-t-0 border-[#454443] px-3 py-1 rounded-b-md text-[#8b8685] hover:text-[#ffffbb] z-10"
        @click.stop="isPopupOpen = !isPopupOpen">
        <span>On this page</span>
      </button>
      <div class="clear-both"></div>

      <!-- Popup content -->
      <div v-if="isPopupOpen" class="absolute top-0 left-0 right-0 bg-[#252423] border-b border-[#454443] p-4 z-5 mt-0">
        <HeadingList :headings="headings" @heading-click="(id) => scrollToHeading(id, true)" />
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import HeadingList from './HeadingList.vue';

const props = defineProps<{
  targetId: string;
}>();

const contentElement = ref<HTMLElement | null>(null);
const headings = ref<Array<{ level: number; id: string; text: string }>>([]);
const isPopupOpen = ref(false);
const displayMode = ref<'desktop' | 'mobile'>('desktop');

// Extract headings from the content
const extractHeadings = () => {
  const target = document.getElementById(props.targetId);
  if (!target) return;

  contentElement.value = target;

  const headingElements = target.querySelectorAll('h2, h3, h4, h5, h6');
  const newHeadings = Array.from(headingElements)
    .filter(heading => heading.id) // Only include headings with IDs
    .map(heading => ({
      level: parseInt(heading.tagName.substring(1)),
      id: heading.id,
      text: heading.textContent || ''
    }));

  headings.value = newHeadings;
};

// Update the outline display mode based on screen width
const updateDisplayMode = () => {
  const threshold = document.documentElement.dataset.layout === 'wide' ? 1600 : 1280
  if (window.innerWidth >= threshold) {
    displayMode.value = 'desktop';
  } else {
    displayMode.value = 'mobile';
  }
};

// Scroll to heading and close popup if needed
const scrollToHeading = (id: string, closePopup = false) => {
  if (closePopup) {
    isPopupOpen.value = false;
  }
};

// Close the popup when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const tab = document.querySelector('.page-outline-tab');
  if (isPopupOpen.value &&
    tab &&
    !tab.contains(event.target as Node)) {
    // Check if we clicked inside the popup content
    const popupContent = document.querySelector('.page-outline-mobile > div:last-child');
    if (popupContent && !popupContent.contains(event.target as Node)) {
      isPopupOpen.value = false;
    }
  }
};

// Setup observers and event listeners
onMounted(() => {
  // Extract headings initially
  extractHeadings();

  // Update display mode
  updateDisplayMode();

  // Setup content observer to watch for changes
  const observer = new MutationObserver(() => {
    extractHeadings();
  });

  if (contentElement.value) {
    observer.observe(contentElement.value, {
      childList: true,
      subtree: true
    });
  }

  // Update display mode when window is resized
  window.addEventListener('resize', updateDisplayMode);

  // Close popup when clicking outside
  document.addEventListener('click', handleClickOutside);

  // Clean up function to be called on component unmount
  onBeforeUnmount(() => {
    observer.disconnect();
    window.removeEventListener('resize', updateDisplayMode);
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>
