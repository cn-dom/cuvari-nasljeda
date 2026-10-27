create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_display_name text;
begin
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'preferred_username'), '')
  );

  if v_display_name is null then
    v_display_name := 'Čuvar-' || left(new.id::text, 8);
  end if;

  if exists (
    select 1
    from public.profiles p
    where lower(trim(coalesce(p.display_name, ''))) = lower(trim(v_display_name))
      and p.id <> new.id
  ) then
    v_display_name := 'Čuvar-' || left(new.id::text, 8);
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, v_display_name)
  on conflict (id) do nothing;

  return new;
end;
$function$;

-- Existing accounts created by OAuth may have a name in auth metadata but
-- an empty public profile because the old trigger only read "display_name".
with candidates as (
  select
    p.id,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'preferred_username'), '')
    ) as candidate_name
  from public.profiles p
  join auth.users u on u.id = p.id
  where nullif(trim(coalesce(p.display_name, '')), '') is null
),
resolved as (
  select
    c.id,
    case
      when c.candidate_name is not null
       and not exists (
         select 1 from public.profiles other
         where other.id <> c.id
           and lower(trim(coalesce(other.display_name, ''))) = lower(trim(c.candidate_name))
       )
      then c.candidate_name
      else 'Čuvar-' || left(c.id::text, 8)
    end as next_name
  from candidates c
)
update public.profiles p
set display_name = r.next_name,
    updated_at = now()
from resolved r
where p.id = r.id;
