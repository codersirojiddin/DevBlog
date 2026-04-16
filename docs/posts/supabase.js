const SUPABASE_URL = "https://uyjmyjetcleghfcwslau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5am15amV0Y2xlZ2hmY3dzbGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU2NzQsImV4cCI6MjA4OTQ5MTY3NH0.-v4Bjy-Ty8pQxaBJFlb4cXDioNFGXXgRsGljH3P19og";

// ── Token management ──────────────────────────────────────────────────────────
function getSession() {
    try { return JSON.parse(localStorage.getItem("sb_session") || "null"); }
    catch { return null; }
}

function saveSession(session) {
    if (session) localStorage.setItem("sb_session", JSON.stringify(session));
    else localStorage.removeItem("sb_session");
}

function isSessionExpired(session) {
    if (!session?.expires_at) return true;
    return Date.now() / 1000 > session.expires_at;
}

function getAccessToken() {
    const session = getSession();
    if (!session || isSessionExpired(session)) {
        saveSession(null);
        return null;
    }
    return session.access_token;
}

// ── Core fetch ────────────────────────────────────────────────────────────────
async function supabaseFetch(path, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${path}`;
    const token = getAccessToken() || SUPABASE_ANON_KEY;
    const headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Prefer": options.prefer || "return=representation",
        ...options.headers
    };
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(text || `Request failed: ${res.status}`);
    }
    if (res.status === 204 || !text.trim()) return null;
    try {
        return JSON.parse(text);
    } catch (err) {
        return text;
    }
}

// ── Auth fetch ────────────────────────────────────────────────────────────────
async function authFetch(path, body) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || "Auth error");
    return data;
}

// ── Auth methods ──────────────────────────────────────────────────────────────
async function signUp(email, password, username) {
    const data = await authFetch("signup", { email, password, data: { username } });
    saveSession(data);
    return data;
}

async function signIn(email, password) {
    const data = await authFetch("token?grant_type=password", { email, password });
    saveSession(data);
    return data;
}

async function signOut() {
    saveSession(null);
}

function getCurrentUser() {
    const session = getSession();
    if (!session || isSessionExpired(session)) {
        saveSession(null);
        return null;
    }
    return session.user || null;
}

async function ensureProfile(user, options = {}) {
    if (!user || !user.id) {
        throw new Error("Unable to verify profile without a signed-in user.");
    }

    const existing = await supabaseFetch(`profiles?id=eq.${user.id}`, { method: "GET" });
    if (Array.isArray(existing) && existing.length > 0) {
        return existing[0];
    }

    const username = options.username || user.email?.split("@")[0] || "user";
    const body = { id: user.id, username, bio: "", avatar_url: "" };
    await supabaseFetch("profiles", { method: "POST", body: JSON.stringify(body) });
    return body;
}

async function getCommunityPost(id) {
    if (!id) throw new Error("Post id is required.");
    const data = await supabaseFetch(`community_posts?id=eq.${encodeURIComponent(id)}`, { method: "GET" });
    return Array.isArray(data) ? data[0] : null;
}

async function updateCommunityPost(id, input) {
    if (!id) throw new Error("Post id is required.");
    const payload = {
        title: input.title,
        type: input.type,
        content: input.content,
        updated_at: new Date().toISOString()
    };
    const result = await supabaseFetch(`community_posts?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
        prefer: "return=representation"
    });
    return Array.isArray(result) ? result[0] : result;
}

async function deleteCommunityPost(id) {
    if (!id) throw new Error("Post id is required.");
    await supabaseFetch(`community_posts?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        prefer: "return=minimal"
    });
    return true;
}

window.SupabaseClient = window.SupabaseClient || {};
Object.assign(window.SupabaseClient, {
    supabaseFetch,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getSession,
    ensureProfile,
    getCommunityPost,
    updateCommunityPost,
    deleteCommunityPost
});