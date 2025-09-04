import { computed } from "vue";
import { createSearchEngineFromJson } from "./searchEngine";
import { indexData, searchText } from "./state";

const searchEngine = computed(() => {
  return indexData.value ? createSearchEngineFromJson(indexData.value) : null;
});

export const searchResults = computed(() => {
  if (!searchText.value) return [];
  return searchEngine.value?.search(searchText.value) || [];
});
