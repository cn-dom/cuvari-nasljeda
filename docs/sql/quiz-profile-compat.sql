-- PatriaSoul quiz profile compatibility
-- REVIEW-ONLY. Run only in the separately confirmed TEST Supabase project.
-- This migration does not create/import quiz questions, city data, attempts or results.

begin;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists role text not null default 'member';

-- Keep quiz admin privileges server-controlled. Members must not promote themselves.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_role_allowed_values'
  ) then
    alter table public.profiles
      add constraint profiles_role_allowed_values check (role in ('member', 'admin'));
  end if;
end $$;

create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Promjena administratorske uloge nije dopuštena.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute function public.guard_profile_role_change();

-- The quiz profile editor expects a public avatar URL. Public reads are limited to avatar files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = 10485760,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "quiz_avatars_read_public" on storage.objects;
create policy "quiz_avatars_read_public"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

drop policy if exists "quiz_avatars_insert_own_folder" on storage.objects;
create policy "quiz_avatars_insert_own_folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "quiz_avatars_delete_own_folder" on storage.objects;
create policy "quiz_avatars_delete_own_folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;
