-- wepink Gulf — database schema (Supabase / Postgres).
--
-- Tables
--   admins       emails allowed into admin.html (a confirmed Supabase Auth account)
--   settings     store settings the admin edits: price increase, referral terms, contacts
--   products     the catalogue the store shows (seeded from assets/js/catalog.js)
--   ambassadors  "Earn with wepink" members, their codes and link visits
--   orders       orders placed at checkout, with referral code and commission
--   customers    everyone who left their details (club, newsletter, checkout,
--                Google / Apple sign-in, …)
--   visits       anonymous page views, recorded only after cookie consent
--
-- Shoppers (the anon role) never read these tables directly, except live
-- products and settings: everything else goes through the functions at the
-- end, which check their input. Admins sign in with Supabase Auth.
--
-- To make someone an admin (they must sign up in admin.html and confirm
-- their email first):
--   insert into public.admins (email) values ('owner@example.com');

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table public.admins (
  email text primary key check (email = lower(btrim(email)) and email like '%_@_%'),
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;

create policy "admins read admins" on public.admins for select to authenticated using ((select public.is_admin()));
create policy "admins add admins" on public.admins for insert to authenticated with check ((select public.is_admin()));
create policy "admins remove others" on public.admins for delete to authenticated
  using ((select public.is_admin()) and email <> lower((select auth.jwt()) ->> 'email'));

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Settings (public: the store reads them on every visit)
-- ---------------------------------------------------------------------------
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

create policy "anyone reads settings" on public.settings for select to anon, authenticated using (true);
create policy "admins add settings" on public.settings for insert to authenticated with check ((select public.is_admin()));
create policy "admins change settings" on public.settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove settings" on public.settings for delete to authenticated using ((select public.is_admin()));

insert into public.settings (key, value) values
  ('pricing', '{"markupPct": 5}'),
  ('referral', '{"friendDiscountPct": 10, "tiers": [{"id": "pink", "minOrders": 0, "pct": 10}, {"id": "hot", "minOrders": 20, "pct": 15}, {"id": "diamond", "minOrders": 50, "pct": 20}]}'),
  ('contact', '{"whatsapp": "", "email": "", "instagram": "", "tiktok": ""}');

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table public.products (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,90}$'),
  active boolean not null default true,
  sort integer not null default 0,
  cat text not null,
  type text not null,
  line text not null check (char_length(line) between 1 and 120), -- name (Latin script)
  line_ar text,                                                     -- Arabic name (non-fragrance products)
  size text,
  family text,
  gender text,
  badge text,
  color text,
  color2 text,
  price numeric(10, 2) not null check (price >= 0), -- AED, before the store-wide price increase
  compare_at numeric(10, 2) check (compare_at is null or compare_at >= 0),
  prices jsonb,       -- exact local prices, e.g. {"SAR": 89, "KWD": 7.25}
  tagline jsonb,      -- {"en": "", "ar": ""}
  description jsonb,  -- {"en": "", "ar": ""}
  notes jsonb,        -- {"top": [["Pink pepper", "فلفل وردي"]], "heart": [], "base": []}
  images text[],      -- null: the photos that ship with the site
  cutout text,        -- transparent-background photo, staged on the store's scenes
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_sort_idx on public.products (sort, id);
alter table public.products enable row level security;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create policy "shoppers see live products" on public.products for select to anon using (active);
create policy "signed-in see live products, admins all" on public.products for select to authenticated using (active or (select public.is_admin()));
create policy "admins add products" on public.products for insert to authenticated with check ((select public.is_admin()));
create policy "admins change products" on public.products for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove products" on public.products for delete to authenticated using ((select public.is_admin()));

-- Product photos (public URLs; only admins upload).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/webp', 'image/png', 'image/jpeg', 'image/avif']);

create policy "admins read product images" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "admins upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "admins replace product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Customers: one row per person (matched by email, then phone)
-- ---------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  name text,
  country text,
  city text,
  lang text,
  sources text[] not null default '{}', -- club, newsletter, checkout, ambassador, stores, account
  marketing boolean not null default false, -- agreed to offers by email / WhatsApp
  details jsonb not null default '{}',
  orders_count integer not null default 0,
  spent_aed numeric(12, 2) not null default 0,
  visitor_id text,
  utm jsonb,  -- how they first found the store
  user_id uuid unique references auth.users (id) on delete set null, -- signed in with Google / Apple
  avatar_url text,
  provider text,
  note text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create unique index customers_email_key on public.customers (email) where email is not null;
create index customers_phone_idx on public.customers (phone);
create index customers_last_seen_idx on public.customers (last_seen desc);
alter table public.customers enable row level security;

create policy "admins read customers" on public.customers for select to authenticated using ((select public.is_admin()));
create policy "admins change customers" on public.customers for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove customers" on public.customers for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Ambassadors & orders
-- ---------------------------------------------------------------------------
create table public.ambassadors (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{4,16}$'),
  name text not null check (char_length(name) between 1 and 120),
  phone text,
  email text,
  handle text,
  country text,
  lang text,
  status text not null default 'active' check (status in ('active', 'paused')),
  clicks integer not null default 0,
  token_hash text not null, -- the ambassador's browser keeps the token to see their stats
  note text,
  created_at timestamptz not null default now()
);
alter table public.ambassadors enable row level security;

create policy "admins read ambassadors" on public.ambassadors for select to authenticated using ((select public.is_admin()));
create policy "admins change ambassadors" on public.ambassadors for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove ambassadors" on public.ambassadors for delete to authenticated using ((select public.is_admin()));

create sequence public.order_number_seq start 100001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  status text not null default 'new' check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned')),
  country text not null,
  currency text not null,
  lang text,
  items jsonb not null,   -- [{"id", "name", "qty", "price"}] in local currency
  subtotal numeric(12, 3) not null,
  discount numeric(12, 3) not null default 0,
  delivery numeric(12, 3) not null default 0,
  total numeric(12, 3) not null,
  total_aed numeric(12, 2) not null,
  ref_code text,
  ambassador_id uuid references public.ambassadors (id) on delete set null,
  commission_pct numeric(5, 2),
  commission_aed numeric(12, 2),
  commission_paid boolean not null default false,
  customer jsonb not null, -- name, email, phone, city, area, street, apt, notes
  customer_id uuid references public.customers (id) on delete set null,
  payment text,
  gift_note text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_ambassador_idx on public.orders (ambassador_id, created_at);
create index orders_customer_idx on public.orders (customer_id);
alter table public.orders enable row level security;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create policy "admins read orders" on public.orders for select to authenticated using ((select public.is_admin()));
create policy "admins change orders" on public.orders for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins remove orders" on public.orders for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Visits: anonymous analytics, sent only after the shopper accepts cookies
-- ---------------------------------------------------------------------------
create table public.visits (
  id bigint generated always as identity primary key,
  visitor_id text not null,
  session_id text not null,
  page text,
  path text,
  referrer text,
  utm jsonb,
  ref_code text,
  geo text,      -- country of the connection (from the CDN), not the shopper's address
  country text,  -- the store country they picked
  lang text,
  device text,
  screen text,
  created_at timestamptz not null default now()
);
create index visits_created_idx on public.visits (created_at desc);
create index visits_visitor_idx on public.visits (visitor_id);
alter table public.visits enable row level security;

create policy "admins read visits" on public.visits for select to authenticated using ((select public.is_admin()));
create policy "admins remove visits" on public.visits for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Functions the store calls (anon). Each checks and trims its input.
-- ---------------------------------------------------------------------------

-- Catalogue version (changes whenever a product is added, edited, hidden or
-- removed) and the public settings, in one call.
create function public.store_state() returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'version', (select count(*)::text || '/' || coalesce(max(updated_at)::text, '') from public.products),
    'settings', coalesce((select jsonb_object_agg(key, value) from public.settings where key in ('pricing', 'referral', 'contact')), '{}'::jsonb)
  );
$$;

-- Internal: add or update a customer. Not callable by shoppers directly.
create function public.upsert_customer(p jsonb, p_source text, p_spent_aed numeric default 0) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p ->> 'email', '')));
  v_phone text := left(regexp_replace(coalesce(p ->> 'phone', ''), '[^0-9+]', '', 'g'), 24);
  v_marketing boolean := coalesce((p ->> 'marketing')::boolean, false);
  v_details jsonb := case when jsonb_typeof(p -> 'details') = 'object' and length((p -> 'details')::text) < 2000 then p -> 'details' else '{}'::jsonb end;
  v_utm jsonb := case when jsonb_typeof(p -> 'utm') = 'object' and length((p -> 'utm')::text) < 600 then p -> 'utm' end;
  v_id uuid;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 200 then v_email := ''; end if;
  if length(v_phone) < 6 then v_phone := ''; end if;
  if v_email = '' and v_phone = '' then return null; end if;

  if v_email <> '' then
    select id into v_id from public.customers where email = v_email;
  end if;
  if v_id is null and v_phone <> '' then
    select id into v_id from public.customers where phone = v_phone order by last_seen desc limit 1;
  end if;

  if v_id is null then
    insert into public.customers (email, phone, name, country, city, lang, sources, marketing, details, orders_count, spent_aed, visitor_id, utm)
    values (
      nullif(v_email, ''), nullif(v_phone, ''), nullif(left(btrim(p ->> 'name'), 120), ''), left(p ->> 'country', 2),
      nullif(left(p ->> 'city', 80), ''), left(p ->> 'lang', 2), array[p_source], v_marketing, v_details,
      case when p_source = 'checkout' then 1 else 0 end, coalesce(p_spent_aed, 0), left(p ->> 'visitor', 64), v_utm
    )
    returning id into v_id;
  else
    update public.customers set
      email = coalesce(email, nullif(v_email, '')),
      phone = coalesce(nullif(v_phone, ''), phone),
      name = coalesce(nullif(left(btrim(p ->> 'name'), 120), ''), name),
      country = coalesce(left(p ->> 'country', 2), country),
      city = coalesce(nullif(left(p ->> 'city', 80), ''), city),
      lang = coalesce(left(p ->> 'lang', 2), lang),
      sources = case when p_source = any (sources) then sources else sources || p_source end,
      marketing = marketing or v_marketing,
      details = details || v_details,
      orders_count = orders_count + case when p_source = 'checkout' then 1 else 0 end,
      spent_aed = spent_aed + coalesce(p_spent_aed, 0),
      visitor_id = coalesce(left(p ->> 'visitor', 64), visitor_id),
      utm = coalesce(utm, v_utm),
      last_seen = now()
    where id = v_id;
  end if;
  return v_id;
end;
$$;

-- Club, newsletter and store-interest sign-ups.
create function public.save_contact(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_source text := p ->> 'source';
  v_id uuid;
begin
  if v_source not in ('club', 'newsletter', 'stores', 'quiz') then
    raise exception 'Unknown form';
  end if;
  v_id := public.upsert_customer(p, v_source);
  if v_id is null then
    raise exception 'An email or phone number is needed';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- Is this an active ambassador's code?
create function public.check_ref(p_code text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.ambassadors where code = upper(left(p_code, 16)) and status = 'active');
$$;

-- Someone opened an ambassador's link (the store sends this once per visit).
create function public.track_ref_click(p_code text) returns void
language sql security definer set search_path = ''
as $$
  update public.ambassadors set clicks = clicks + 1 where code = upper(left(p_code, 16)) and status = 'active';
$$;

-- "Earn with wepink" sign-up: returns the new code and a private token.
create function public.register_ambassador(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_name text := left(btrim(coalesce(p ->> 'name', '')), 120);
  v_phone text := left(regexp_replace(coalesce(p ->> 'phone', ''), '[^0-9+]', '', 'g'), 24);
  v_email text := lower(left(btrim(coalesce(p ->> 'email', '')), 200));
  v_pct int;
  v_base text;
  v_code text;
  v_token text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_try int := 0;
begin
  if v_name = '' or (length(v_phone) < 6 and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'Name and phone or email are needed';
  end if;
  select coalesce((value ->> 'friendDiscountPct')::int, 10) into v_pct from public.settings where key = 'referral';
  v_pct := coalesce(v_pct, 10);
  v_base := upper(left(regexp_replace(split_part(v_name, ' ', 1), '[^A-Za-z]', '', 'g'), 10));
  if length(v_base) < 3 then v_base := 'PINK'; end if;
  v_code := v_base || v_pct;
  while exists (select 1 from public.ambassadors where code = v_code) loop
    v_try := v_try + 1;
    v_code := case when v_try < 20 then v_base || (10 + floor(random() * 90))::int || v_pct
                   else 'PINK' || (100000 + floor(random() * 900000))::int end;
  end loop;

  insert into public.ambassadors (code, name, phone, email, handle, country, lang, token_hash)
  values (v_code, v_name, nullif(v_phone, ''), nullif(v_email, ''), nullif(left(btrim(p ->> 'handle'), 80), ''),
          left(p ->> 'country', 2), left(p ->> 'lang', 2), encode(sha256(convert_to(v_token, 'UTF8')), 'hex'));

  perform public.upsert_customer(p || jsonb_build_object('details', jsonb_build_object('ambassadorCode', v_code)), 'ambassador');
  return jsonb_build_object('code', v_code, 'token', v_token);
end;
$$;

-- An ambassador's own numbers (needs the token from sign-up).
create function public.ambassador_stats(p_code text, p_token text) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_amb public.ambassadors;
begin
  select * into v_amb from public.ambassadors
  where code = upper(left(p_code, 16)) and token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
  if v_amb.id is null then
    return null;
  end if;
  return (
    select jsonb_build_object(
      'status', v_amb.status,
      'clicks', v_amb.clicks,
      'orders', count(*) filter (where o.status not in ('cancelled', 'returned')),
      'ordersMonth', count(*) filter (where o.status not in ('cancelled', 'returned') and o.created_at >= date_trunc('month', now())),
      'pendingAed', coalesce(sum(o.commission_aed) filter (where o.status in ('new', 'confirmed', 'shipped')), 0),
      'earnedAed', coalesce(sum(o.commission_aed) filter (where o.status = 'delivered' and not o.commission_paid), 0),
      'paidAed', coalesce(sum(o.commission_aed) filter (where o.status = 'delivered' and o.commission_paid), 0)
    )
    from public.orders o where o.ambassador_id = v_amb.id
  );
end;
$$;

-- Checkout. Prices come from the shopper's page and are confirmed by the
-- team before dispatch; commission is worked out here from the referral terms.
create function public.place_order(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_country text := upper(coalesce(p ->> 'country', ''));
  v_rate numeric;
  v_currency text;
  v_items jsonb := p -> 'items';
  v_c jsonb := coalesce(p -> 'customer', '{}'::jsonb);
  v_sub numeric := (p ->> 'subtotal')::numeric;
  v_disc numeric := coalesce((p ->> 'discount')::numeric, 0);
  v_del numeric := coalesce((p ->> 'delivery')::numeric, 0);
  v_total numeric := (p ->> 'total')::numeric;
  v_code text := nullif(upper(regexp_replace(coalesce(p ->> 'code', ''), '[^A-Za-z0-9]', '', 'g')), '');
  v_marketing boolean := coalesce((p ->> 'marketing')::boolean, false);
  v_amb_id uuid;
  v_count int;
  v_pct numeric;
  v_comm numeric;
  v_number text;
  v_customer uuid;
begin
  -- AED -> local rates, as in assets/js/data.js.
  select f.rate, f.cur into v_rate, v_currency
  from (values ('AE', 1::numeric, 'AED'), ('SA', 1.0211, 'SAR'), ('QA', 0.9912, 'QAR'),
               ('KW', 0.0837, 'KWD'), ('BH', 0.1026, 'BHD'), ('OM', 0.1048, 'OMR')) as f (code, rate, cur)
  where f.code = v_country;
  if v_rate is null then raise exception 'Unknown country'; end if;
  if jsonb_typeof(v_items) is distinct from 'array' or jsonb_array_length(v_items) not between 1 and 60 or length(v_items::text) > 20000 then
    raise exception 'Invalid items';
  end if;
  if v_sub is null or v_total is null or v_sub < 0 or v_disc < 0 or v_del < 0 or v_total < 0 or v_total > 1000000 then
    raise exception 'Invalid totals';
  end if;
  if jsonb_typeof(v_c) <> 'object' or length(v_c::text) > 3000
     or char_length(btrim(coalesce(v_c ->> 'name', ''))) not between 1 and 120
     or char_length(regexp_replace(coalesce(v_c ->> 'phone', ''), '[^0-9]', '', 'g')) < 6 then
    raise exception 'Name and phone are needed';
  end if;

  if v_code is not null then
    select id into v_amb_id from public.ambassadors where code = left(v_code, 16) and status = 'active';
  end if;
  if v_amb_id is not null then
    -- Tier by orders this month, counting this one.
    select count(*) + 1 into v_count from public.orders
    where ambassador_id = v_amb_id and status not in ('cancelled', 'returned') and created_at >= date_trunc('month', now());
    select (t ->> 'pct')::numeric into v_pct
    from public.settings s, jsonb_array_elements(s.value -> 'tiers') t
    where s.key = 'referral' and (t ->> 'minOrders')::int <= v_count
    order by (t ->> 'minOrders')::int desc limit 1;
    v_pct := coalesce(v_pct, 10);
    v_comm := round(greatest(v_sub - v_disc, 0) / v_rate * v_pct / 100, 2);
  end if;

  -- A signed-in shopper's order goes on their own record.
  if (select auth.uid()) is not null then
    select id into v_customer from public.customers where user_id = (select auth.uid());
  end if;
  if v_customer is not null then
    update public.customers set
      name = coalesce(name, nullif(left(btrim(v_c ->> 'name'), 120), '')),
      phone = coalesce(phone, nullif(left(regexp_replace(coalesce(v_c ->> 'phone', ''), '[^0-9+]', '', 'g'), 24), '')),
      country = v_country,
      city = coalesce(nullif(left(v_c ->> 'city', 80), ''), city),
      lang = coalesce(left(p ->> 'lang', 2), lang),
      sources = case when 'checkout' = any (sources) then sources else sources || 'checkout'::text end,
      marketing = marketing or v_marketing,
      orders_count = orders_count + 1,
      spent_aed = spent_aed + round(v_total / v_rate, 2),
      visitor_id = coalesce(left(p ->> 'visitor', 64), visitor_id),
      last_seen = now()
    where id = v_customer;
  else
    v_customer := public.upsert_customer(
      v_c || jsonb_build_object('country', v_country, 'lang', p ->> 'lang', 'visitor', p ->> 'visitor', 'utm', p -> 'utm', 'marketing', v_marketing),
      'checkout', round(v_total / v_rate, 2));
  end if;

  v_number := 'WPG-' || nextval('public.order_number_seq');
  insert into public.orders (number, country, currency, lang, items, subtotal, discount, delivery, total, total_aed,
                             ref_code, ambassador_id, commission_pct, commission_aed, customer, customer_id, payment, gift_note)
  values (v_number, v_country, v_currency, left(p ->> 'lang', 2), v_items, v_sub, v_disc, v_del, v_total, round(v_total / v_rate, 2),
          left(v_code, 16), v_amb_id, case when v_amb_id is not null then v_pct end, v_comm, v_c, v_customer,
          left(p ->> 'payment', 20), nullif(left(p ->> 'gift', 300), ''));
  return jsonb_build_object('number', v_number);
end;
$$;

-- A page view (only sent after cookie consent).
create function public.track_visit(p jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_headers json := nullif(current_setting('request.headers', true), '')::json;
begin
  if coalesce(p ->> 'visitor', '') !~ '^[A-Za-z0-9-]{8,64}$' or coalesce(p ->> 'session', '') !~ '^[A-Za-z0-9-]{8,64}$' then
    return;
  end if;
  insert into public.visits (visitor_id, session_id, page, path, referrer, utm, ref_code, geo, country, lang, device, screen)
  values (
    p ->> 'visitor', p ->> 'session', left(p ->> 'page', 40), left(p ->> 'path', 300), nullif(left(p ->> 'referrer', 300), ''),
    case when jsonb_typeof(p -> 'utm') = 'object' and length((p -> 'utm')::text) < 600 then p -> 'utm' end,
    nullif(left(upper(p ->> 'ref'), 16), ''), left(v_headers ->> 'cf-ipcountry', 2), left(p ->> 'country', 2),
    left(p ->> 'lang', 2), left(p ->> 'device', 12), left(p ->> 'screen', 12)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Shopper accounts (Google / Apple sign-in, signed-in users only)
-- ---------------------------------------------------------------------------

-- Links (or creates) the signed-in shopper's customer record from their
-- Google / Apple profile, and returns it with their orders.
create function public.my_account() returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_user auth.users;
  v_meta jsonb;
  v_name text;
  v_avatar text;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Sign in first';
  end if;
  select * into v_user from auth.users where id = v_uid;
  v_meta := coalesce(v_user.raw_user_meta_data, '{}'::jsonb);
  v_name := nullif(left(btrim(coalesce(v_meta ->> 'full_name', v_meta ->> 'name', '')), 120), '');
  v_avatar := nullif(left(coalesce(v_meta ->> 'avatar_url', v_meta ->> 'picture', ''), 500), '');

  select id into v_id from public.customers where user_id = v_uid;
  -- Someone who already left details with this (verified) email gets linked to that record.
  if v_id is null and v_user.email is not null and v_user.email_confirmed_at is not null then
    select id into v_id from public.customers where email = lower(v_user.email) and user_id is null;
  end if;
  if v_id is null then
    insert into public.customers (user_id, email, name, avatar_url, provider, sources)
    values (v_uid, lower(v_user.email), v_name, v_avatar, coalesce(v_user.raw_app_meta_data ->> 'provider', 'email'), array['account'])
    returning id into v_id;
  else
    update public.customers set
      user_id = v_uid,
      email = coalesce(email, lower(v_user.email)),
      name = coalesce(name, v_name),
      avatar_url = coalesce(v_avatar, avatar_url),
      provider = coalesce(v_user.raw_app_meta_data ->> 'provider', provider),
      sources = case when 'account' = any (sources) then sources else sources || 'account'::text end,
      last_seen = now()
    where id = v_id;
  end if;

  return (
    select jsonb_build_object(
      'name', c.name, 'email', c.email, 'phone', c.phone, 'country', c.country, 'city', c.city,
      'avatar', c.avatar_url, 'provider', c.provider, 'birthday', c.details ->> 'birthday', 'marketing', c.marketing,
      'orders', coalesce((
        select jsonb_agg(jsonb_build_object('number', o.number, 'status', o.status, 'total', o.total, 'currency', o.currency, 'date', o.created_at,
                                            'items', (select coalesce(sum((i ->> 'qty')::int), 0) from jsonb_array_elements(o.items) i))
                         order by o.created_at desc)
        from public.orders o where o.customer_id = c.id), '[]'::jsonb)
    )
    from public.customers c where c.id = v_id
  );
end;
$$;

-- The signed-in shopper updates their own details (and can stop offers).
create function public.save_my_account(p jsonb) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Sign in first';
  end if;
  perform public.my_account();
  update public.customers set
    name = coalesce(nullif(left(btrim(p ->> 'name'), 120), ''), name),
    phone = case when p ? 'phone' then nullif(left(regexp_replace(coalesce(p ->> 'phone', ''), '[^0-9+]', '', 'g'), 24), '') else phone end,
    country = coalesce(nullif(left(p ->> 'country', 2), ''), country),
    lang = coalesce(nullif(left(p ->> 'lang', 2), ''), lang),
    marketing = coalesce((p ->> 'marketing')::boolean, marketing),
    details = case
      when not p ? 'birthday' then details
      when coalesce(p ->> 'birthday', '') ~ '^\d{2}-\d{2}$' then details || jsonb_build_object('birthday', p ->> 'birthday')
      else details - 'birthday' end,
    last_seen = now()
  where user_id = v_uid;
  return public.my_account();
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin reports
-- ---------------------------------------------------------------------------
create function public.admin_overview(p_days int default 30) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_from timestamptz := now() - make_interval(days => greatest(1, least(p_days, 366)));
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;
  return jsonb_build_object(
    'visits', (select count(*) from public.visits where created_at >= v_from),
    'visitors', (select count(distinct visitor_id) from public.visits where created_at >= v_from),
    'byDay', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'visits', v, 'visitors', u) order by d)
      from (select created_at::date d, count(*) v, count(distinct visitor_id) u from public.visits where created_at >= v_from group by 1) x), '[]'),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (select coalesce(page, '?') k, count(*) n from public.visits where created_at >= v_from group by 1 order by 2 desc limit 10) x), '[]'),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (
        select coalesce(utm ->> 'source', case when ref_code is not null then 'ambassador ' || ref_code end,
                        substring(referrer from '^https?://(?:www\.)?([^/:]+)'), 'direct') k,
               count(distinct session_id) n
        from public.visits where created_at >= v_from group by 1 order by 2 desc limit 10) x), '[]'),
    'geo', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (select coalesce(geo, '?') k, count(distinct visitor_id) n from public.visits where created_at >= v_from group by 1 order by 2 desc limit 12) x), '[]'),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (select coalesce(device, '?') k, count(distinct visitor_id) n from public.visits where created_at >= v_from group by 1) x), '[]'),
    'langs', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (select coalesce(lang, '?') k, count(distinct visitor_id) n from public.visits where created_at >= v_from group by 1) x), '[]'),
    'orders', (select count(*) from public.orders where created_at >= v_from and status not in ('cancelled', 'returned')),
    'revenueAed', (select coalesce(sum(total_aed), 0) from public.orders where created_at >= v_from and status not in ('cancelled', 'returned')),
    'ordersByStatus', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) n from public.orders group by 1) x), '{}'),
    'customers', (select count(*) from public.customers),
    'newCustomers', (select count(*) from public.customers where first_seen >= v_from),
    'marketing', (select count(*) from public.customers where marketing),
    'ambassadors', (select count(*) from public.ambassadors),
    'refClicks', (select coalesce(sum(clicks), 0) from public.ambassadors),
    'commissionDueAed', (select coalesce(sum(commission_aed), 0) from public.orders where status = 'delivered' and not commission_paid)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Who may call what. The store's functions are meant to be public (Supabase's
-- security advisor lists them as "security definer functions anon can run");
-- each one checks its input and returns only what the shopper may see.
-- ---------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.store_state() to anon, authenticated;
grant execute on function public.save_contact(jsonb) to anon, authenticated;
grant execute on function public.check_ref(text) to anon, authenticated;
grant execute on function public.track_ref_click(text) to anon, authenticated;
grant execute on function public.register_ambassador(jsonb) to anon, authenticated;
grant execute on function public.ambassador_stats(text, text) to anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.track_visit(jsonb) to anon, authenticated;
grant execute on function public.admin_overview(int) to authenticated;
grant execute on function public.my_account() to authenticated;
grant execute on function public.save_my_account(jsonb) to authenticated;
