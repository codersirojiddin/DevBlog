// ── Password config ──────────────────────────────────────────────────────────
// Change this to your desired admin password.
// This is stored in sessionStorage (cleared when browser tab closes).
const ADMIN_PASSWORD = "19881984";
const SESSION_KEY = "devblog.admin.auth";

// ── DOM refs ─────────────────────────────────────────────────────────────────
const loginScreen   = document.getElementById("login-screen");
const adminScreen   = document.getElementById("admin-screen");
const passwordInput = document.getElementById("password-input");
const loginBtn      = document.getElementById("login-btn");
const loginError    = document.getElementById("login-error");
const logoutBtn     = document.getElementById("logout-btn");

const form          = document.getElementById("post-form");
const titleInput    = document.getElementById("post-title");
const typeInput     = document.getElementById("post-type");
const contentInput  = document.getElementById("post-content");
const highlightInput= document.getElementById("post-highlighted");
const formStatus    = document.getElementById("form-status");
const postList      = document.getElementById("admin-post-list");
const submitBtn     = document.getElementById("submit-btn");
const cancelBtn     = document.getElementById("cancel-edit");
const adminCount    = document.getElementById("admin-count");
const panelTitle    = document.querySelector(".panel-title");

let editingId = "";

// ── Auth ──────────────────────────────────────────────────────────────────────
function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "true";
}

function showAdmin() {
    loginScreen.hidden = true;
    adminScreen.hidden = false;
    renderAdminPosts();
}

function showLogin() {
    loginScreen.hidden = false;
    adminScreen.hidden = true;
}

loginBtn.addEventListener("click", () => {
    if (passwordInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "true");
        loginError.hidden = true;
        passwordInput.value = "";
        showAdmin();
    } else {
        loginError.hidden = false;
        passwordInput.focus();
    }
});

passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginBtn.click();
});

logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
});

// Check session on load
if (isLoggedIn()) {
    showAdmin();
} else {
    showLogin();
}

// ── Form ──────────────────────────────────────────────────────────────────────
function setStatus(message, isError = false) {
    formStatus.textContent = message;
    formStatus.className = "status" + (isError ? " status--error" : " status--ok");
}

function resetForm() {
    editingId = "";
    form.reset();
    submitBtn.textContent = "Publish Post";
    cancelBtn.hidden = true;
    const panelTitle = document.querySelector(".panel h2.panel-title");
    if (panelTitle) panelTitle.textContent = "New Post";
    setStatus("");
}

function startEditing(post) {
    editingId = post.id;
    titleInput.value = post.title;
    typeInput.value = post.type;
    contentInput.value = post.content;
    highlightInput.checked = Boolean(post.highlighted);
    submitBtn.textContent = "Save Changes";
    cancelBtn.hidden = false;
    setStatus(`Editing: "${post.title}"`, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelBtn.addEventListener("click", () => {
    resetForm();
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? "Saving..." : "Publishing...";

    const payload = {
        title: titleInput.value,
        type: typeInput.value,
        content: contentInput.value,
        highlighted: highlightInput.checked
    };

    try {
        if (editingId) {
            await window.DevBlogPosts.updatePost(editingId, payload);
            setStatus("✓ Post updated successfully.");
        } else {
            await window.DevBlogPosts.createPost(payload);
            setStatus("✓ Post published successfully.");
        }
        resetForm();
        await renderAdminPosts();
    } catch (err) {
        setStatus(err.message || "Failed to save post.", true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingId ? "Save Changes" : "Publish Post";
    }
});

// ── Post list ─────────────────────────────────────────────────────────────────
async function renderAdminPosts() {
    postList.innerHTML = `<div class="loading-state"><div class="spinner"></div> Loading...</div>`;
    try {
        const posts = await window.DevBlogPosts.getPosts();
        adminCount.textContent = posts.length ? `(${posts.length})` : "";
        postList.innerHTML = "";

        if (posts.length === 0) {
            postList.innerHTML = `<p class="empty-state">No posts yet. Publish your first post!</p>`;
            return;
        }

        posts.forEach((post) => {
            const card = document.createElement("article");
            card.className = "admin-post-card";

            card.innerHTML = `
                <div class="admin-post-card__heading">
                    <div>
                        <h3>${escapeHtml(post.title)}</h3>
                        <div class="post-badges" style="margin-top:6px;">
                            <span class="post-badge">${window.DevBlogPosts.toLabel(post.type)}</span>
                            ${post.highlighted ? `<span class="post-badge post-badge--highlight">Featured</span>` : ""}
                        </div>
                    </div>
                    <span class="post-meta">${window.DevBlogPosts.formatDate(post.updated_at || post.created_at)}</span>
                </div>
                <p class="post-preview">${escapeHtml(post.content.split("\n").slice(0, 1).join("\n"))}...</p>
                <div class="admin-actions">
                    <button class="btn" data-action="edit" data-id="${post.id}">Edit</button>
                    <button class="btn btn--secondary" data-action="toggle" data-id="${post.id}">
                        ${post.highlighted ? "Unfeature" : "Feature"}
                    </button>
                    <button class="btn btn--danger" data-action="delete" data-id="${post.id}">Delete</button>
                </div>
            `;

            postList.appendChild(card);
        });
    } catch (err) {
        postList.innerHTML = `<p class="empty-state">Failed to load posts: ${err.message}</p>`;
    }
}

postList.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const postId = btn.dataset.id;

    try {
        if (action === "edit") {
            const posts = await window.DevBlogPosts.getPosts();
            const post = posts.find(p => p.id === postId);
            if (post) startEditing(post);
            return;
        }

        if (action === "delete") {
            if (!confirm("Delete this post? This cannot be undone.")) return;
            await window.DevBlogPosts.deletePost(postId);
            if (editingId === postId) resetForm();
            setStatus("Post deleted.");
        }

        if (action === "toggle") {
            await window.DevBlogPosts.toggleHighlight(postId);
            setStatus("Featured status updated.");
        }

        await renderAdminPosts();
    } catch (err) {
        setStatus(err.message || "Action failed.", true);
    }
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
