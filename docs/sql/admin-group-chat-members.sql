-- PatriaSoul · Čuvari nasljeđa
-- Owner-only membership inspection. Does not expose group message contents.
create or replace function public.admin_group_chat_members(p_group_id uuid)
returns table (
  group_id uuid,
  user_id uuid,
  display_name text,
  username text,
  role text,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'patriasoul@protonmail.com' then
    raise exception 'Vlasnički pristup je obavezan.' using errcode = '42501';
  end if;
  if p_group_id is null then
    raise exception 'ID grupe je obavezan.' using errcode = '22004';
  end if;
  return query
    select m.group_id, m.user_id, coalesce(p.display_name, ''), p.username, m.role, m.joined_at
    from public.group_chat_members m
    left join public.profiles p on p.id = m.user_id
    where m.group_id = p_group_id
    order by case when m.role = 'admin' then 0 else 1 end, m.joined_at asc;
end;
$$;
revoke all on function public.admin_group_chat_members(uuid) from public;
revoke all on function public.admin_group_chat_members(uuid) from anon;
grant execute on function public.admin_group_chat_members(uuid) to authenticated;

-- Member removal is documented separately in admin-remove-group-chat-member.sql.
