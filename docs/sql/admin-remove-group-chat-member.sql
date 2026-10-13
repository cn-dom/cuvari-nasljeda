-- PatriaSoul · Čuvari nasljeđa
-- Owner-only removal of ordinary group members. Group admins/creator are protected.
create or replace function public.admin_remove_group_chat_member(p_group_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  member_role text;
  group_creator uuid;
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'patriasoul@protonmail.com' then
    raise exception 'Vlasnički pristup je obavezan.' using errcode = '42501';
  end if;
  if p_group_id is null or p_user_id is null then
    raise exception 'ID grupe i člana su obavezni.' using errcode = '22004';
  end if;

  select created_by into group_creator
  from public.group_chats where id = p_group_id;
  if not found then
    raise exception 'Grupa nije pronađena.' using errcode = 'P0002';
  end if;
  if p_user_id = group_creator then
    raise exception 'Osnivača grupe nije moguće ukloniti ovom radnjom.' using errcode = '42501';
  end if;

  select role into member_role
  from public.group_chat_members
  where group_id = p_group_id and user_id = p_user_id;
  if not found then
    raise exception 'Član nije pronađen u ovoj grupi.' using errcode = 'P0002';
  end if;
  if member_role = 'admin' then
    raise exception 'Administratora grupe nije moguće ukloniti ovom radnjom.' using errcode = '42501';
  end if;

  delete from public.group_chat_members
  where group_id = p_group_id and user_id = p_user_id;
  return found;
end;
$$;
revoke all on function public.admin_remove_group_chat_member(uuid, uuid) from public;
revoke all on function public.admin_remove_group_chat_member(uuid, uuid) from anon;
grant execute on function public.admin_remove_group_chat_member(uuid, uuid) to authenticated;
