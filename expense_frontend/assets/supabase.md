# Supabase Integration Notes

- Auth: Email/password using supabase-js v2.
- Env: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY, optional REACT_APP_SITE_URL.
- Storage: Create bucket `receipts` (public).
- Database table `expenses`:

```sql
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  amount numeric not null,
  category text not null,
  date timestamptz not null,
  notes text,
  receipt_url text
);
```

RLS policies (example):
```sql
alter table public.expenses enable row level security;

create policy "Users can manage their expenses"
on public.expenses
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

Storage policy (example):
- receipts bucket public read; write restricted to authenticated users.
