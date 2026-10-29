-- Run once in Supabase → SQL editor. Each table is: id text primary key, data jsonb.
-- The shop talks to these tables only from the server with the service-role key, so row level security is ON with no public policies.
do $$
declare t text;
begin
  foreach t in array array['products','orders','discounts','influencers','clicks','payouts','settings'] loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null default ''{}''::jsonb, created_at timestamptz not null default now())', t);
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Product photos (public read). Uploads happen server-side from the admin panel.
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
