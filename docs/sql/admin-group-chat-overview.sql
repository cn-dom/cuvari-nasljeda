-- PatriaSoul · Čuvari nasljeđa
-- Owner-only overview for group chats in the admin dashboard.
-- The function exposes aggregate counts and group metadata, not message contents.

create or replace function public.admin_group_chat_overview()
returns table (
  group_id uuid,
  name text,
  created_by uuid,
  created_at timestamptz,
  member_count bigint,
  message_count bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'patriasoul@protonmail.com' then
    raise exception 'Vlasnički pristup je obavezan.' using errcode = '42501';
  end if;

  return query
    select g.id, g.name, g.created_by, g.created_at,
      (select count(*) from public.group_chat_members m where m.group_id = g.id),
      (select count(*) from public.group_chat_messages msg where msg.group_id = g.id)
    from public.group_chats g
    order by g.created_at desc;
end;
$$;

revoke all on function public.admin_group_chat_overview() from public;
revoke all on function public.admin_group_chat_overview() from anon;
grant execute on function public.admin_group_chat_overview() to authenticated;
