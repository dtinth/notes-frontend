import { ofetch } from "ofetch";
import { ref } from "vue";

export const open = ref(true);
export const loading = ref(true);
export const error = ref("");
export const indexData = ref<any>(null);
export const searchText = ref("");

async function loadSearchIndex() {
  const url =
    "https://htrqhjrmmqrqaccchyne.supabase.co/storage/v1/object/public/notes-public/notes.index.json";
  try {
    const data = await ofetch(url, { responseType: "text" });
    indexData.value = data;
  } catch (e) {
    error.value = `Unable to load search index: ${e}`;
    console.error(e);
  } finally {
    loading.value = false;
  }
}

loadSearchIndex();
