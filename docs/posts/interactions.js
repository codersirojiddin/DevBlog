// interactions.js — Likes & Comments for DevBlog

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function loadLikes(postId) {
  const likeBtn = document.getElementById('like-btn');
  const likeCount = document.getElementById('like-count');
  if (!likeBtn || !likeCount) return;
  try {
    const count = await window.SupabaseClient.getLikesCount(postId);
    likeCount.textContent = count;
    const user = window.SupabaseClient.getCurrentUser();
    if (user) {
      const hasLiked = await window.SupabaseClient.hasUserLiked(postId, user.id);
      likeBtn.classList.toggle('liked', hasLiked);
      likeBtn.title = hasLiked ? 'Unlike this post' : 'Like this post';
    }
  } catch (error) {
    console.error('Error loading likes:', error);
  }
}

async function toggleLike(postId) {
  const user = window.SupabaseClient.getCurrentUser();
  if (!user) { alert('Please log in to like posts.'); return; }
  try {
    const hasLiked = await window.SupabaseClient.hasUserLiked(postId, user.id);
    if (hasLiked) {
      await window.SupabaseClient.removeLike(postId, user.id);
    } else {
      await window.SupabaseClient.addLike(postId, user.id);
    }
    await loadLikes(postId);
  } catch (error) {
    console.error('Error toggling like:', error);
  }
}

async function loadComments(postId) {
  const container = document.getElementById('comments-list');
  if (!container) return;
  try {
    const comments = await window.SupabaseClient.getComments(postId);
    if (!comments || comments.length === 0) {
      container.innerHTML = '<p class="comments-empty">No comments yet. Be the first!</p>';
      return;
    }
    const user = window.SupabaseClient.getCurrentUser();
    container.innerHTML = comments.map(c => `
      <div class="comment" data-id="${c.id}">
        <div class="comment-header">
          <span class="comment-author">${escapeHtml(c.username)}</span>
          <span class="comment-date">${formatDate(c.created_at)}</span>
          ${user && user.id === c.user_id
            ? `<button class="comment-delete-btn" onclick="window._deleteComment('${c.id}', '${postId}')">Delete</button>`
            : ''}
        </div>
        <p class="comment-body">${escapeHtml(c.body)}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading comments:', error);
    container.innerHTML = '<p class="comments-error">Could not load comments.</p>';
  }
}

async function submitComment(postId) {
  const input = document.getElementById('comment-input');
  const body = input?.value?.trim();
  if (!body) return;
  const user = window.SupabaseClient.getCurrentUser();
  if (!user) { alert('Please log in to comment.'); return; }
  try {
    const username = user.user_metadata?.username
      || user.user_metadata?.full_name
      || user.email?.split('@')[0]
      || 'Anonymous';
    await window.SupabaseClient.addComment(postId, user.id, username, body);
    input.value = '';
    await loadComments(postId);
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Failed to post comment. Please try again.');
  }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Are you sure you want to delete this comment?')) return;
  try {
    await window.SupabaseClient.deleteComment(commentId);
    await loadComments(postId);
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}

function initInteractions(postId) {
  window._deleteComment = (id, pid) => deleteComment(id, pid);

  loadLikes(postId);
  loadComments(postId);

  const likeBtn = document.getElementById('like-btn');
  if (likeBtn) likeBtn.addEventListener('click', () => toggleLike(postId));

  const submitBtn = document.getElementById('comment-submit');
  if (submitBtn) submitBtn.addEventListener('click', () => submitComment(postId));

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

// Global ga chiqarish - dynamic import o'rniga
window.initInteractions = initInteractions;