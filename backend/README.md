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

## SQL — likes table

```sql
create table likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);
```

## SQL — profiles table

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  bio text,
  avatar_url text,
  skills text[] default '{}',
  tech_stack text[] default '{}',
  availability boolean default true,
  trust_score numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Migration — Add new profile columns

If you have an existing profiles table, run these to add the new columns:

```sql
alter table profiles add column if not exists skills text[] default '{}';
alter table profiles add column if not exists tech_stack text[] default '{}';
alter table profiles add column if not exists availability boolean default true;
alter table profiles add column if not exists trust_score numeric default 0;
```

## SQL — projects table

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null check (status in ('idea', 'in_progress', 'mvp', 'launched')),
  owner_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## SQL — project_roles table

```sql
create table project_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  skills text[] default '{}',
  level text check (level in ('beginner', 'intermediate', 'expert')),
  commitment text check (commitment in ('part_time', 'full_time', 'contract')),
  compensation text check (compensation in ('volunteer', 'paid', 'equity')),
  created_at timestamptz default now()
);
```

## SQL — project_applications table

```sql
create table project_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  role_id uuid not null references project_roles(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now()
);
```

## SQL — project_team_members table

```sql
create table project_team_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  role_id uuid not null references project_roles(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  joined_at timestamptz default now()
);
```

## SQL — user_bookmarks table

```sql
create table user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, project_id)
);
```

## SQL — project_comments table

```sql
create table project_comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz default now()
);
```

## SQL — follows table

```sql
create table follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id),
  following_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);
```

## Deploying

1. Push this repo to GitHub
2. Enable GitHub Pages on the `frontend/` folder (or root)
3. Done — no server to manage
