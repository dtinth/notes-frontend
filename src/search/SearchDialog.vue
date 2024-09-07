<template>
  <dialog ref="dialog" class="bg-transparent backdrop:bg-black/40">
    <div
      class="w-[80vw] h-[80vh] max-w-[640px] max-h-[480px] bg-#252423 border border-#656463 rounded-lg shadow-xl flex flex-col pt-3 px-4 pb-4 gap-2 text-#e9e8e7">
      <div class="flex flex-none items-center">
        <h1 class="text-#8b8685 font-bold">Search notes</h1>
        <div class="flex-1"></div>
        <div>
          <button @click="dialog?.close()" class="text-#8b8685 flex">
            <iconify-icon icon="bi:x-lg" class="text-#8b8685"></iconify-icon>
          </button>
        </div>
      </div>
      <input ref="input" type="text"
        class="w-full h-10 px-2 border border-#454443 bg-#090807 text-#e9e8e7 rounded placeholder:text-#8b8685"
        placeholder="Search for a note…" v-model="searchText" @keydown="onKeydown" />
      <div class="flex-1 overflow-y-auto overflow-x-hidden" ref="resultsDiv">
        <div class="rounded p-2 border border-transparent" v-if="loading">
          Loading…
        </div>
        <div class="rounded p-2 border border-transparent bg-red-400/20" v-if="error">
          {{ error }}
        </div>
        <template v-for="result in searchResults.slice(0, 25)" :key="result.id">
          <a class="block rounded p-2 border border-transparent hover:border-#ffffbb/10 hover:bg-#ffffbb/5 truncate text-#8b8685"
            :href="result.id">
            <span class="text-#ffffbb">{{ result.title }}</span>
            {{ " — " }}
            {{ result.excerpt }}
          </a>
        </template>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { searchResults } from './searchResults';
import { error, loading, open, searchText } from './state';

const dialog = ref<HTMLDialogElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const resultsDiv = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (open) {
    dialog.value?.showModal()
    input.value?.focus()
  }
  dialog.value?.addEventListener('close', () => {
    open.value = false
  })
})

watch(() => open.value, (value) => {
  if (value) {
    dialog.value?.showModal()
  } else {
    dialog.value?.close()
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    const link = resultsDiv.value?.querySelector('a')
    link?.click()
  }
}
</script>