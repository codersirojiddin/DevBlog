// interactions.js — Likes & Comments for ither.online
// Place this file in /docs/posts/interactions.js
// Import your supabase client (adjust path if needed)
import { supabase } from './supabase.js';

// ─── LIKES ───────────────────────────────────────────────────────────────────

/**
 * Load like count + whether current user has liked this post.
 * Updates the like button UI automatically.
 */
export async function loadLikes(postId) {
  const likeBtn = document.getElementById('like-btn');
  const likeCount = document.getElementById('like-count');
  if (!likeBtn || !likeCount) return;

  // Get total likes for this post
  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  likeCount.textContent = count ?? 0;

  // Check if current user already liked
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    likeBtn.classList.toggle('liked', !!existing);
    likeBtn.title = existing ? 'Unlike this post' : 'Like this post';
  }
}

/**
 * Toggle like/unlike for the current user on a post.
 */
export async function toggleLike(postId) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert('Please log in to like posts.');
    return;
  }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existing.id);
  } else {
    // Like (UNIQUE constraint prevents duplicates at DB level too)
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
  }

  await loadLikes(postId);
}

// ─── COMMENTS ────────────────────────────────────────────────────────────────

/**
 * Load and render all comments for a post.
 */
export async function loadComments(postId) {
  const container = document.getElementById('comments-list');
  if (!container) return;

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    container.innerHTML = '<p class="comments-error">Could not load comments.</p>';
    return;
  }

  if (!comments || comments.length === 0) {
    container.innerHTML = '<p class="comments-empty">No comments yet. Be the first!</p>';
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();

  container.innerHTML = comments.map(c => `
    <div class="comment" data-id="${c.id}">
      <div class="comment-header">
        <span class="comment-author">${escapeHtml(c.username)}</span>
        <span class="comment-date">${formatDate(c.created_at)}</span>
        ${user && user.id === c.user_id
          ? `<button class="comment-delete-btn" onclick="deleteComment('${c.id}', '${postId}')">Delete</button>`
          : ''}
      </div>
      <p class="comment-body">${escapeHtml(c.body)}</p>
    </div>
  `).join('');
}

/**
 * Submit a new comment.
 */
export async function submitComment(postId) {
  const input = document.getElementById('comment-input');
  const body = input?.value?.trim();

  if (!body) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert('Please log in to comment.');
    return;
  }

  // Get display name from user metadata, fallback to email prefix
  const username = user.user_metadata?.username
    || user.user_metadata?.full_name
    || user.email?.split('@')[0]
    || 'Anonymous';

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    username,
    body,
  });

  if (error) {
    alert('Failed to post comment. Please try again.');
    return;
  }

  input.value = '';
  await loadComments(postId);
}

/**
 * Delete a comment (only the owner can do this).
 */
export async function deleteComment(commentId, postId) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (!error) await loadComments(postId);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

/**
 * Initialize likes + comments on a post page.
 * Call this with the post's unique ID (e.g. slug or UUID).
 *
 * Usage in your post HTML:
 *   import { initInteractions } from './interactions.js';
 *   initInteractions('my-post-slug');
 */
export function initInteractions(postId) {
  // Expose deleteComment globally so inline onclick works
  window.deleteComment = (id) => deleteComment(id, postId);

  // Load initial state
  loadLikes(postId);
  loadComments(postId);

  // Like button
  const likeBtn = document.getElementById('like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => toggleLike(postId));
  }

  // Comment submit button
  const submitBtn = document.getElementById('comment-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => submitComment(postId));
  }

  // Allow Enter key in textarea (Shift+Enter for newline)
  const input = document.getElementById('comment-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment(postId);
      }
    });
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}