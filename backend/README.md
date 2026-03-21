# Backend

This project uses **Supabase** as the database with the JS client called directly
from the frontend. No backend server is required.

## Why no Go server?

Since all posts are publicly readable and admin auth is handled client-side
via `sessionStorage`, a full backend server is not needed for this setup.
The Supabase anon key is safe to use in the browser for read/write operations
on a public blog.

## Supabase credentials

Stored in: `frontend/posts/supabase.js`

If you ever want to move to a Go backend (e.g. for private posts or more
complex auth), the `supabase.js` client can be replaced with API calls to
your own server, which reads credentials from a `.env` file.

## SQL — posts table

Run this in Supabase SQL Editor to create the table:

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

## Deploying

1. Push this repo to GitHub
2. Enable GitHub Pages on the `frontend/` folder (or root)
3. Done — no server to manage
