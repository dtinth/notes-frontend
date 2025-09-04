import memoizeOne from "async-memoize-one";
import { ofetch } from "ofetch";
import { NotesGetContentsResult } from "../io";
import { unwrap } from "../utils/unwrap";

const getSupabase = memoizeOne(async () => {
  const Supabase = await import("@supabase/supabase-js");
  const supabase = Supabase.createClient(
    "https://htrqhjrmmqrqaccchyne.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cnFoanJtbXFycWFjY2NoeW5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkxOTk3NDIsImV4cCI6MTk3NDc3NTc0Mn0.VEdURpInV9dowpoMkHopAzpiBtNnRXDgO6hRfy1ZSHY"
  );
  Object.assign(window, { supabase });
  return supabase;
});

async function signInWithGoogle() {
  const div = document.createElement("div");
  div.className = "absolute top-[64px] left-2";
  div.innerHTML = `<div id="g_id_onload"
     data-client_id="347735770628-4n43ifcg3mmce5ema444thhosdtoougl.apps.googleusercontent.com"
     data-context="signin"
     data-ux_mode="popup"
     data-callback="onGoogleAuth"
     data-auto_prompt="false">
</div>
<div class="g_id_signin"
     data-type="standard"
     data-shape="rectangular"
     data-theme="filled_blue"
     data-text="signin_with"
     data-size="large"
     data-logo_alignment="left">
</div>`;
  document.body.appendChild(div);
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  document.body.appendChild(script);
  return new Promise<{ credential: string }>((resolve) => {
    Object.assign(window, {
      onGoogleAuth: (googleUser: any) => {
        resolve(googleUser);
      },
    });
  });
}

const getSettings = memoizeOne(async () => {
  const supabase = await getSupabase();
  const { user } = unwrap(await supabase.auth.getUser());
  if (!user) {
    throw new Error("User is not signed in");
  }
  const data =
    unwrap(await supabase.from("notes_settings").select("id, value")) || [];
  return Object.fromEntries(data.map((x) => [x.id, x.value])) as {
    privateUrl: string;
  };
});

let storedToken: { accessToken: string; expires: number } | undefined;
async function getNotesAccessToken() {
  if (storedToken && storedToken.expires > Date.now()) {
    return storedToken.accessToken;
  }
  const supabase = await getSupabase();
  const settings = await getSettings();
  const accessToken = unwrap(await supabase.auth.getSession()).session
    ?.access_token;
  if (!accessToken) {
    throw new Error("Access token is not available");
  }
  const result = await ofetch<{ accessToken: string }>(
    `${settings.privateUrl}/auth/supabase`,
    {
      method: "POST",
      body: { supabaseAccessToken: accessToken },
    }
  );
  storedToken = {
    accessToken: result.accessToken,
    expires: Date.now() + 1000 * 60 * 15,
  };
  return result.accessToken;
}

export async function fetchPrivateNoteContents(
  id: string
): Promise<NotesGetContentsResult> {
  const supabase = await getSupabase();

  // Check if the user is signed in
  const { data: { user } = {}, error } = await supabase.auth.getUser();
  if (!user) {
    if (error) {
      console.error(error);
    }
    signInWithGoogle().then(async (user) => {
      const { data: result, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: user.credential,
      });
      if (error) {
        console.error(error);
      }
      console.log("Signed in", result);
    });
    return {
      id,
      source: "# Private note",
    };
  }

  const token = await getNotesAccessToken();
  const settings = await getSettings();
  const result = await ofetch<{ source: string }>(
    `${settings.privateUrl}/web/notes/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return {
    id,
    source: result.source,
  };
}
