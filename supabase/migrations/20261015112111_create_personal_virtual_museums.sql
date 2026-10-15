create table public.virtual_museums (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'Moj virtualni muzej' check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1200),
  introduction text not null default '' check (char_length(introduction) <= 3000),
  ai_draft text not null default '' check (char_length(ai_draft) <= 30000),
  status text not null default 'draft' check (status in ('draft', 'review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index virtual_museums_owner_updated_idx on public.virtual_museums (owner_id, updated_at desc);
alter table public.virtual_museums enable row level security;
grant select, insert, update, delete on public.virtual_museums to authenticated;
create policy "Owners can read their virtual museums" on public.virtual_museums for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Owners can create their virtual museums" on public.virtual_museums for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Owners can update their virtual museums" on public.virtual_museums for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Owners can delete their virtual museums" on public.virtual_museums for delete to authenticated using ((select auth.uid()) = owner_id);

create table public.virtual_museum_items (
  id uuid primary key default gen_random_uuid(),
  museum_id uuid not null references public.virtual_museums(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '' check (char_length(description) <= 5000),
  story text not null default '' check (char_length(story) <= 3000),
  place text not null default '' check (char_length(place) <= 180),
  date_label text not null default '' check (char_length(date_label) <= 120),
  theme text not null default '' check (char_length(theme) <= 180),
  image_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index virtual_museum_items_owner_museum_idx on public.virtual_museum_items (owner_id, museum_id, sort_order);
alter table public.virtual_museum_items enable row level security;
grant select, insert, update, delete on public.virtual_museum_items to authenticated;
create policy "Owners can read their virtual museum items" on public.virtual_museum_items for select to authenticated using ((select auth.uid()) = owner_id and exists (select 1 from public.virtual_museums m where m.id = virtual_museum_items.museum_id and m.owner_id = (select auth.uid())));
create policy "Owners can add items to their virtual museums" on public.virtual_museum_items for insert to authenticated with check ((select auth.uid()) = owner_id and exists (select 1 from public.virtual_museums m where m.id = virtual_museum_items.museum_id and m.owner_id = (select auth.uid())));
create policy "Owners can update their virtual museum items" on public.virtual_museum_items for update to authenticated using ((select auth.uid()) = owner_id and exists (select 1 from public.virtual_museums m where m.id = virtual_museum_items.museum_id and m.owner_id = (select auth.uid()))) with check ((select auth.uid()) = owner_id and exists (select 1 from public.virtual_museums m where m.id = virtual_museum_items.museum_id and m.owner_id = (select auth.uid())));
create policy "Owners can delete their virtual museum items" on public.virtual_museum_items for delete to authenticated using ((select auth.uid()) = owner_id and exists (select 1 from public.virtual_museums m where m.id = virtual_museum_items.museum_id and m.owner_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('virtual-museum', 'virtual-museum', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;
create policy "Virtual museum owners can upload images" on storage.objects for insert to authenticated with check (bucket_id = 'virtual-museum' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Virtual museum owners can read their images" on storage.objects for select to authenticated using (bucket_id = 'virtual-museum' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Virtual museum owners can update their images" on storage.objects for update to authenticated using (bucket_id = 'virtual-museum' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'virtual-museum' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Virtual museum owners can delete their images" on storage.objects for delete to authenticated using (bucket_id = 'virtual-museum' and (storage.foldername(name))[1] = (select auth.uid())::text);
