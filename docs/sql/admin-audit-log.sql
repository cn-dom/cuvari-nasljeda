-- PatriaSoul · Čuvari nasljeđa
-- Vlasnički zapisnik moderatorskih radnji.
-- Primijenjeno na testni Supabase projekt: azerctpwfzdivydsxyex.

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in (
    'post_deleted','comment_deleted','event_cancelled','report_status_changed',
    'reported_post_deleted','group_member_removed'
  )),
  entity_type text not null check (entity_type in ('post','comment','event','report','group_member')),
  entity_id text not null check (char_length(entity_id) between 1 and 120),
  summary text not null check (char_length(summary) between 1 and 240),
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_action_idx
  on public.admin_audit_log (action, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists admin_audit_log_owner_read on public.admin_audit_log;
create policy admin_audit_log_owner_read on public.admin_audit_log
  for select to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com');

revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create or replace function public.admin_log_event(
  p_action text, p_entity_type text, p_entity_id text, p_summary text
) returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare new_id bigint;
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'patriasoul@protonmail.com' then
    raise exception 'Vlasnički pristup je obavezan.' using errcode = '42501';
  end if;
  if p_action not in ('post_deleted','comment_deleted','event_cancelled','report_status_changed','reported_post_deleted','group_member_removed')
     or p_entity_type not in ('post','comment','event','report','group_member') then
    raise exception 'Nepoznata vrsta administratorske radnje.' using errcode = '22023';
  end if;
  if p_entity_id is null or char_length(p_entity_id) not between 1 and 120
     or p_summary is null or char_length(trim(p_summary)) not between 1 and 240 then
    raise exception 'Nedostaju podaci za zapisnik.' using errcode = '22023';
  end if;
  insert into public.admin_audit_log(actor_id, action, entity_type, entity_id, summary)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, trim(p_summary))
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.admin_log_event(text, text, text, text) from public;
revoke all on function public.admin_log_event(text, text, text, text) from anon;
grant execute on function public.admin_log_event(text, text, text, text) to authenticated;
