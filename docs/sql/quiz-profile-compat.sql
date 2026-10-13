-- PatriaSoul quiz profile compatibility
-- REVIEW-ONLY. Run only in the separately confirmed TEST Supabase project.
-- This migration does not create/import quiz questions, city data, attempts or results.

begin;

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.profiles
  add column if not exists role text not null default 'member';

alter table public.profiles
  add column if not exists avatar_path text;

grant select (avatar_url) on table public.profiles to anon, authenticated;
grant update (avatar_url) on table public.profiles to authenticated;

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
declare
  v_privileged boolean := (
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or current_user in ('postgres', 'supabase_admin')
  );
begin
  if tg_op = 'INSERT' then
    if new.role is distinct from 'member' and not v_privileged then
      raise exception 'Administratorsku ulogu nije moguće dodijeliti kroz registraciju.';
    end if;
    return new;
  end if;
  if new.role is distinct from old.role and not v_privileged then
    raise exception 'Promjena administratorske uloge nije dopuštena.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
  before insert or update of role on public.profiles
  for each row execute function public.guard_profile_role_change();

revoke all on function public.guard_profile_role_change() from public;
revoke all on function public.guard_profile_role_change() from anon;
revoke all on function public.guard_profile_role_change() from authenticated;

commit;
