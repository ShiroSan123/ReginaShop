-- GreenShop storage setup for Supabase
-- Creates a public bucket for product images + policies.

insert into storage.buckets (id, name, public)
values ('regina-storage', 'regina-storage', true)
on conflict (id)
do update set name = excluded.name, public = excluded.public;

-- Public read/write policies (open access). Replace "true" with
-- "auth.role() = 'authenticated'" or a custom check for production.

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects
  for select
  using (bucket_id = 'regina-storage');

drop policy if exists "Public insert product images" on storage.objects;
create policy "Public insert product images"
  on storage.objects
  for insert
  with check (bucket_id = 'regina-storage');

drop policy if exists "Public update product images" on storage.objects;
create policy "Public update product images"
  on storage.objects
  for update
  using (bucket_id = 'regina-storage')
  with check (bucket_id = 'regina-storage');

drop policy if exists "Public delete product images" on storage.objects;
create policy "Public delete product images"
  on storage.objects
  for delete
  using (bucket_id = 'regina-storage');
