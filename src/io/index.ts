import { ofetch } from "ofetch";
import { Tree } from "../linker";

export interface NotesGetContentsResult {
  source: string;
  id: string;
}

export async function fetchPublicNoteContents(slug: string) {
  const data = await ofetch<NotesGetContentsResult[]>(
    "https://htrqhjrmmqrqaccchyne.supabase.co/rest/v1/rpc/notes_get_contents?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnFoanJtbXFycWFjY2NoeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxOTk3NDIsImV4cCI6MTk3NDc3NTc0Mn0.VEdURpInV9dowpoMkHopAzpiBtNnRXDgO6hRfy1ZSHY",
    { method: "POST", body: { input_search_key: slug.toLowerCase() } }
  );
  return data[0];
}

export async function fetchTree() {
  const data = await ofetch<Tree>(
    "https://htrqhjrmmqrqaccchyne.supabase.co/storage/v1/object/public/notes-public/notes.tree.json"
  );
  return data;
}
