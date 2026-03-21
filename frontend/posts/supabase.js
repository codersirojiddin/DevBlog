const SUPABASE_URL = "https://uyjmyjetcleghfcwslau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5am15amV0Y2xlZ2hmY3dzbGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU2NzQsImV4cCI6MjA4OTQ5MTY3NH0.-v4Bjy-Ty8pQxaBJFlb4cXDioNFGXXgRsGljH3P19og";

async function supabaseFetch(path, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": options.prefer || "return=representation",
        ...options.headers
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

window.SupabaseClient = { supabaseFetch };
