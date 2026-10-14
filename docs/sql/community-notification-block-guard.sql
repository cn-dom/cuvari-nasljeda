-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — NE IZVRŠAVATI NA PRODUKCIJSKOJ BAZI BEZ TESTA.
-- Sprječava stvaranje community_notifications između članova koji su se blokirali.
-- Zadržava postojeće provjere da je pozivatelj autor komentara i da je
-- obavijest o spominjanju/odgovoru opravdana.

begin;

create or replace function public.create_community_notification(
  p_user_id uuid,
  p_comment_id uuid,
  p_type text default 'mention'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
  v_content text;
  v_parent_id uuid;
begin
  if v_actor is null then
    raise exception 'Moraš biti prijavljen.';
  end if;

  if p_type is null or p_type not in ('mention', 'reply') then
    raise exception 'Nevažeća vrsta obavijesti.';
  end if;

  select c.content, c.parent_id
    into v_content, v_parent_id
  from public.community_comments c
  where c.id = p_comment_id and c.user_id = v_actor;

  if not found then
    raise exception 'Obavijest se može slati samo za vlastiti komentar.';
  end if;

  if p_user_id = v_actor or not exists (
    select 1 from public.profiles p where p.id = p_user_id
  ) then
    return null;
  end if;

  if p_type = 'mention' and not exists (
    select 1 from public.profiles p
    where p.id = p_user_id
      and position(lower('@' || trim(p.display_name)) in lower(v_content)) > 0
  ) then
    raise exception 'Spominjanje mora odgovarati imenu člana u komentaru.';
  end if;

  if p_type = 'reply' and not exists (
    select 1 from public.community_comments parent_comment
    where parent_comment.id = v_parent_id
      and parent_comment.user_id = p_user_id
  ) then
    raise exception 'Obavijest o odgovoru mora biti poslana autoru izvornog komentara.';
  end if;

  if exists (
    select 1 from public.blocked_users b
    where (b.blocker_id = v_actor and b.blocked_id = p_user_id)
       or (b.blocker_id = p_user_id and b.blocked_id = v_actor)
  ) then
    return null;
  end if;

  insert into public.community_notifications(user_id, actor_id, comment_id, type)
  values (p_user_id, v_actor, p_comment_id, p_type)
  returning id into v_id;

  return v_id;
end;
$function$;

commit;
