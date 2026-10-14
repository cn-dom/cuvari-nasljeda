-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — NE IZVRŠAVATI NA PRODUKCIJSKOJ BAZI BEZ TESTA.
-- Nakon provjere u odvojenom Supabase testnom projektu, ovaj trigger šalje
-- obavijest kada objava ili komentar sadrži @korisnicko_ime postojećeg člana.
-- Ne šalje obavijest autoru za vlastitu oznaku i uklanja duplikate oznaka
-- istog člana unutar jednog sadržaja.

begin;

create or replace function public.notify_members_mentioned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_username text;
  v_recipient_id uuid;
  v_notification_type text;
  v_title text;
  v_body text;
begin
  if coalesce(new.body, '') = '' or new.author_id is null then
    return new;
  end if;

  v_notification_type := case
    when tg_table_name = 'posts' then 'mention_post'
    else 'mention_comment'
  end;

  v_title := case
    when tg_table_name = 'posts' then 'Označen/a si u objavi'
    else 'Označen/a si u komentaru'
  end;

  v_body := case
    when tg_table_name = 'posts' then 'Član te je označio u objavi na zidu zajednice.'
    else 'Član te je označio u komentaru na zidu zajednice.'
  end;

  for v_username in
    select distinct lower((m.matches)[1])
    from regexp_matches(new.body, '@([[:alnum:]_.-]{1,30})', 'g') as m(matches)
  loop
    select p.id
      into v_recipient_id
    from public.profiles as p
    where lower(btrim(p.username)) = v_username
      and p.id <> new.author_id
    limit 1;

    if v_recipient_id is not null then
      insert into public.notifications
        (recipient_id, actor_id, type, title, body, reference_id)
      values
        (v_recipient_id, new.author_id, v_notification_type, v_title, v_body, new.id);
    end if;

    v_recipient_id := null;
  end loop;

  return new;
end;
$function$;

drop trigger if exists posts_notify_members_mentioned on public.posts;
create trigger posts_notify_members_mentioned
after insert on public.posts
for each row execute function public.notify_members_mentioned();

drop trigger if exists comments_notify_members_mentioned on public.comments;
create trigger comments_notify_members_mentioned
after insert on public.comments
for each row execute function public.notify_members_mentioned();

-- Obavijesti može stvarati samo trigger/funkcija s ovlastima; klijent ne dobiva
-- INSERT politiku na notifications. RLS čitanja i označavanja pročitanim ostaje
-- ograničen na recipient_id = auth.uid().

commit;
