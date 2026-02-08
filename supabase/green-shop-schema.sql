-- GreenShop schema for Supabase (Postgres)
-- Creates products, orders, settings tables + updated_date trigger + RLS policies.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(12, 2) not null default 0,
  old_price numeric(12, 2),
  category text not null,
  subcategory text,
  images text[] not null default '{}',
  in_stock boolean not null default true,
  featured boolean not null default false,
  condition text not null default 'new',
  tags text[] not null default '{}',
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.products
  drop constraint if exists products_category_check,
  add constraint products_category_check
    check (category in ('plants', 'china', 'personal'));

alter table public.products
  drop constraint if exists products_condition_check,
  add constraint products_condition_check
    check (condition in ('new', 'like_new', 'good', 'fair'));

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);
create index if not exists products_in_stock_idx on public.products (in_stock);
create index if not exists products_created_date_idx on public.products (created_date desc);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  total numeric(12, 2) not null default 0,
  status text not null default 'pending',
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

alter table public.orders
  drop constraint if exists orders_status_check,
  add constraint orders_status_check
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'));

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_date_idx on public.orders (created_date desc);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  admin_password text not null,
  shop_name text,
  contact_phone text,
  contact_email text,
  telegram text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create or replace function public.set_updated_date()
returns trigger as $$
begin
  new.updated_date = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_date on public.products;
create trigger set_products_updated_date
before update on public.products
for each row execute function public.set_updated_date();

drop trigger if exists set_orders_updated_date on public.orders;
create trigger set_orders_updated_date
before update on public.orders
for each row execute function public.set_updated_date();

drop trigger if exists set_settings_updated_date on public.settings;
create trigger set_settings_updated_date
before update on public.settings
for each row execute function public.set_updated_date();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;

-- Public read/write policies (open access). Replace "true" with
-- "auth.role() = 'authenticated'" or a custom check for production.

drop policy if exists "Public read products" on public.products;
create policy "Public read products"
  on public.products
  for select
  using (true);

drop policy if exists "Public insert products" on public.products;
create policy "Public insert products"
  on public.products
  for insert
  with check (true);

drop policy if exists "Public update products" on public.products;
create policy "Public update products"
  on public.products
  for update
  using (true)
  with check (true);

drop policy if exists "Public delete products" on public.products;
create policy "Public delete products"
  on public.products
  for delete
  using (true);



drop policy if exists "Public read orders" on public.orders;
create policy "Public read orders"
  on public.orders
  for select
  using (true);

drop policy if exists "Public insert orders" on public.orders;
create policy "Public insert orders"
  on public.orders
  for insert
  with check (true);

drop policy if exists "Public update orders" on public.orders;
create policy "Public update orders"
  on public.orders
  for update
  using (true)
  with check (true);

drop policy if exists "Public delete orders" on public.orders;
create policy "Public delete orders"
  on public.orders
  for delete
  using (true);



drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings"
  on public.settings
  for select
  using (true);

drop policy if exists "Public insert settings" on public.settings;
create policy "Public insert settings"
  on public.settings
  for insert
  with check (true);

drop policy if exists "Public update settings" on public.settings;
create policy "Public update settings"
  on public.settings
  for update
  using (true)
  with check (true);

drop policy if exists "Public delete settings" on public.settings;
create policy "Public delete settings"
  on public.settings
  for delete
  using (true);
