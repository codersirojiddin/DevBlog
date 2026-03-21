# DevBlog

A personal blog site with a Supabase backend. Posts are stored in PostgreSQL
and served directly to the browser — no server required.

## Structure

```
frontend/
  index.html          ← Home (featured posts)
  style.css           ← Shared styles
  articles/           ← Articles feed
  news/               ← News feed
  code/               ← Code snippets feed
  about/              ← About page
  contact/            ← Contact page
  iamadmin/           ← Admin panel (password protected)
    index.html
    admin.js
    style.css
  posts/
    supabase.js       ← Supabase client config
    posts.js          ← Data layer (CRUD + rendering)
backend/
  README.md
```

## Setup

### 1. Create Supabase table

In your Supabase SQL Editor, run:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  type text not null check (type in ('article', 'news', 'code')),
  highlighted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. Admin password

The admin password is set in `frontend/iamadmin/admin.js`:

```js
const ADMIN_PASSWORD = "your-password-here";
```

Change this to whatever you want.

### 3. Deploy to GitHub Pages

1. Push repo to GitHub
2. Go to repo **Settings → Pages**
3. Set source to `Deploy from a branch`, branch `main`, folder `/frontend`
4. Your site will be live at `https://yourusername.github.io/reponame/`

## Admin panel

Visit `/iamadmin/` → enter your password → publish, edit, delete posts.

Posts are immediately visible to all visitors across all devices.
