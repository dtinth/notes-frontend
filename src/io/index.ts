import { ofetch } from "ofetch";

export async function fetchPublicNoteContents(slug: string) {
  const data = await ofetch<{ source: string }[]>(
    "https://htrqhjrmmqrqaccchyne.supabase.co/rest/v1/rpc/notes_get_contents?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnFoanJtbXFycWFjY2NoeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxOTk3NDIsImV4cCI6MTk3NDc3NTc0Mn0.VEdURpInV9dowpoMkHopAzpiBtNnRXDgO6hRfy1ZSHY",
    { method: "POST", body: { input_search_key: slug.toLowerCase() } }
  );
  return data[0].source;
}
