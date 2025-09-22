-- Expense Tracker - Supabase SQL Setup
-- This script creates tables: profiles (linked to auth.users), categories, expenses, receipts
-- and configures Row Level Security (RLS) with least-privilege policies.
-- Run in Supabase SQL Editor or CLI (supabase db query).

-- Enable required extensions (uuid generation, if not already enabled)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- 1) User profile table (references auth.users)
--    Keeps per-user profile data and simplifies foreign keys for other tables.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- 2) Categories
--    Default global categories are inserted; users can also create custom categories.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade, -- null => global category
  name text not null,
  color text,  -- optional hex or token
  created_at timestamptz not null default now()
);

-- Unique per user (or globally when user_id is null)
create unique index if not exists categories_user_name_unq
  on public.categories (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name));

-- Seed common global categories (only insert if not present)
insert into public.categories (id, user_id, name, color)
select gen_random_uuid(), null, t.name, t.color
from (values
  ('Food', '#2563EB'),
  ('Transport', '#10B981'),
  ('Housing', '#8B5CF6'),
  ('Utilities', '#F59E0B'),
  ('Shopping', '#F97316'),
  ('Health', '#EF4444'),
  ('Entertainment', '#22D3EE'),
  ('Travel', '#3B82F6'),
  ('Education', '#84CC16'),
  ('Other', '#6B7280')
) as t(name, color)
where not exists (
  select 1 from public.categories c
  where c.user_id is null and lower(c.name) = lower(t.name)
);

-- 3) Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category_id uuid references public.categories(id) on delete set null,
  category text, -- legacy/fallback category label if not using category_id (kept for compatibility with frontend)
  date timestamptz not null,
  notes text,
  receipt_url text, -- optional public URL if using Storage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
before update on public.expenses
for each row execute procedure public.set_updated_at();

create index if not exists idx_expenses_user_date on public.expenses (user_id, date desc);
create index if not exists idx_expenses_category on public.expenses (category);
create index if not exists idx_expenses_category_id on public.expenses (category_id);

-- 4) Receipts table (for metadata; actual files should be in Supabase Storage bucket `receipts`)
create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  storage_path text not null, -- e.g., user_id/timestamp.ext
  public_url text,            -- cached public URL
  mime_type text,
  size_bytes integer check (size_bytes >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_receipts_user on public.receipts (user_id);
create index if not exists idx_receipts_expense on public.receipts (expense_id);

-- RLS: Enable row level security on all user-scoped tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.receipts enable row level security;

-- Policies

-- profiles: users can view and update only their own profile, and insert their own row (on first sign-in via trigger or manually)
drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Profiles: insert self" on public.profiles;
create policy "Profiles: insert self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- categories:
-- Read policy: allow reading global (user_id is null) and own categories
drop policy if exists "Categories: read global and own" on public.categories;
create policy "Categories: read global and own"
on public.categories
for select
to authenticated
using (user_id is null or user_id = auth.uid());

-- Insert/update/delete: only own categories (not global)
drop policy if exists "Categories: manage own" on public.categories;
create policy "Categories: manage own"
on public.categories
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- expenses: users manage only their rows
drop policy if exists "Expenses: read own" on public.expenses;
create policy "Expenses: read own"
on public.expenses
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Expenses: insert own" on public.expenses;
create policy "Expenses: insert own"
on public.expenses
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Expenses: update own" on public.expenses;
create policy "Expenses: update own"
on public.expenses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Expenses: delete own" on public.expenses;
create policy "Expenses: delete own"
on public.expenses
for delete
to authenticated
using (user_id = auth.uid());

-- receipts: users manage only their rows
drop policy if exists "Receipts: read own" on public.receipts;
create policy "Receipts: read own"
on public.receipts
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Receipts: insert own" on public.receipts;
create policy "Receipts: insert own"
on public.receipts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Receipts: update own" on public.receipts;
create policy "Receipts: update own"
on public.receipts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Receipts: delete own" on public.receipts;
create policy "Receipts: delete own"
on public.receipts
for delete
to authenticated
using (user_id = auth.uid());

-- Optional: trigger to auto-create profile on first sign-in using auth.users
-- If you prefer to create profiles via edge functions or client code, you can skip this.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Notes:
-- 1) Create Supabase Storage bucket named 'receipts' (public read recommended). Example:
--    select storage.create_bucket('receipts', public := true, file_size_limit := 10485760); -- 10MB
-- 2) Add storage policies to allow authenticated users to upload to their own folder:
--    -- Allow read for everyone (if bucket is public)
--    -- Allow authenticated users to upload and manage files under their own user_id prefix
--    -- In SQL editor, adjust if your org needs private buckets.

-- Example storage policies (run after bucket creation):
-- begin;
--   -- Allow public read if bucket is set to public
--   create policy "Public read receipts"
--   on storage.objects for select
--   to public
--   using (bucket_id = 'receipts');
--
--   -- Allow users to manage files in their own folder: 'user_id/*'
--   create policy "Users upload to own folder"
--   on storage.objects for insert
--   to authenticated
--   with check (
--     bucket_id = 'receipts'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
--   create policy "Users update own files"
--   on storage.objects for update
--   to authenticated
--   using (
--     bucket_id = 'receipts'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   )
--   with check (
--     bucket_id = 'receipts'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
--   create policy "Users delete own files"
--   on storage.objects for delete
--   to authenticated
--   using (
--     bucket_id = 'receipts'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
-- commit;

-- Compatibility with frontend:
-- The current React app expects 'expenses' with columns: id, user_id, title, amount, category, date, notes, receipt_url.
-- This schema provides exactly those fields; category_id is optional for richer linkage to categories.
