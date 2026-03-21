(() => {
    const VALID_TYPES = new Set(["article", "news", "code"]);

    function normalizeText(value) {
        return String(value || "").trim();
    }

    function toIsoNow() {
        return new Date().toISOString();
    }

    async function getPosts(filters = {}) {
        const type = normalizeText(filters.type).toLowerCase();
        const highlightedOnly = Boolean(filters.highlightedOnly);

        let query = "posts?order=updated_at.desc";
        if (type && VALID_TYPES.has(type)) {
            query += `&type=eq.${type}`;
        }
        if (highlightedOnly) {
            query += `&highlighted=eq.true`;
        }

        return window.SupabaseClient.supabaseFetch(query, { method: "GET" });
    }

    async function getPost(id) {
        const data = await window.SupabaseClient.supabaseFetch(`posts?id=eq.${id}`, { method: "GET" });
        return data?.[0] || null;
    }

    async function createPost(input) {
        const title = normalizeText(input.title);
        const content = normalizeText(input.content);
        const type = normalizeText(input.type).toLowerCase();

        if (!title) throw new Error("Title is required.");
        if (!content) throw new Error("Content is required.");
        if (!VALID_TYPES.has(type)) throw new Error("Invalid post type.");

        const now = toIsoNow();
        const post = {
            title,
            content,
            type,
            highlighted: Boolean(input.highlighted),
            created_at: now,
            updated_at: now
        };

        const result = await window.SupabaseClient.supabaseFetch("posts", {
            method: "POST",
            body: JSON.stringify(post)
        });
        return Array.isArray(result) ? result[0] : result;
    }

    async function updatePost(id, input) {
        const postId = normalizeText(id);
        if (!postId) throw new Error("Post id is required.");

        const title = normalizeText(input.title);
        const content = normalizeText(input.content);
        const type = normalizeText(input.type).toLowerCase();

        if (!title) throw new Error("Title is required.");
        if (!content) throw new Error("Content is required.");
        if (!VALID_TYPES.has(type)) throw new Error("Invalid post type.");

        const result = await window.SupabaseClient.supabaseFetch(`posts?id=eq.${postId}`, {
            method: "PATCH",
            body: JSON.stringify({
                title,
                content,
                type,
                highlighted: Boolean(input.highlighted),
                updated_at: toIsoNow()
            })
        });
        return Array.isArray(result) ? result[0] : result;
    }

    async function deletePost(id) {
        const postId = normalizeText(id);
        if (!postId) throw new Error("Post id is required.");
        await window.SupabaseClient.supabaseFetch(`posts?id=eq.${postId}`, {
            method: "DELETE",
            prefer: "return=minimal"
        });
        return true;
    }

    async function toggleHighlight(id) {
        const post = await getPost(id);
        if (!post) throw new Error("Post not found.");
        return updatePost(id, { ...post, highlighted: !post.highlighted });
    }

    function formatDate(isoValue) {
        const timestamp = Date.parse(isoValue || "");
        if (Number.isNaN(timestamp)) return "Unknown date";
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    }

    function toLabel(type) {
        if (type === "article") return "Article";
        if (type === "news") return "News";
        return "Code";
    }

    function getPreview(text, lines = 1) {
        return text.split("\n").slice(0, lines).join("\n");
    }

    function renderPosts(container, posts, options = {}) {
        if (!container) return;
        const emptyText = normalizeText(options.emptyText) || "No posts yet.";
        const showType = options.showType !== false;
        container.innerHTML = "";

        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = `<p class="empty-state">${emptyText}</p>`;
            return;
        }

        posts.forEach((post) => {
            const preview = getPreview(post.content, 1);
            const hasMore = post.content.split("\n").length > 1 || post.content.length > preview.length;

            const card = document.createElement("article");
            card.className = "post-card";
            card.dataset.id = post.id;
            if (hasMore) {
                card.style.cursor = "pointer";
            }

            card.innerHTML = `
                <div class="post-card__heading">
                    <h3 class="post-card__title">${escapeHtml(post.title)}</h3>
                    <div class="post-badges">
                        ${showType ? `<span class="post-badge">${toLabel(post.type)}</span>` : ""}
                        ${post.highlighted ? `<span class="post-badge post-badge--highlight">Featured</span>` : ""}
                    </div>
                </div>
                <p class="post-preview">${escapeHtml(preview)}${hasMore ? "..." : ""}</p>
                <div class="post-full" hidden>
                    <p class="post-content">${escapeHtml(post.content)}</p>
                </div>
                <div class="post-footer">
                    <span class="post-meta">${formatDate(post.updated_at || post.created_at)}</span>
                </div>
            `;

            if (hasMore) {
                card.addEventListener("click", () => {
                    const full = card.querySelector(".post-full");
                    const preview = card.querySelector(".post-preview");
                    const expanded = full.hidden;
                    full.hidden = !expanded;
                    preview.hidden = expanded;
                });
            }

            container.appendChild(card);
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    window.DevBlogPosts = {
        createPost,
        updatePost,
        deletePost,
        toggleHighlight,
        getPosts,
        getPost,
        renderPosts,
        toLabel,
        formatDate
    };
})();
