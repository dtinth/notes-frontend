import { ofetch } from "ofetch";

export async function fetchPublicNoteContents(slug: string) {
  const data = await ofetch<{ contents: string }>(
    "https://htrqhjrmmqrqaccchyne.supabase.co/rest/v1/rpc/get_note_contents?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnFoanJtbXFycWFjY2NoeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxOTk3NDIsImV4cCI6MTk3NDc3NTc0Mn0.VEdURpInV9dowpoMkHopAzpiBtNnRXDgO6hRfy1ZSHY",
    { method: "POST", body: { note_id: slug } }
  );
  return data.contents;
}
