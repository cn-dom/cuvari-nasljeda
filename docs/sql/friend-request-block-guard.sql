-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — NE IZVRŠAVATI NA PRODUKCIJSKOJ BAZI BEZ TESTA.
-- Odbija zahtjeve za prijateljstvo ako je bilo koja strana blokirala drugu.
-- Također odbija prihvaćanje ranije poslanog zahtjeva dok blokada postoji.
-- Ne briše automatski postojeća prijateljstva niti stare zahtjeve.
-- Dodatna zaštita: nakon stvaranja zahtjeva nije dopušteno mijenjati pošiljatelja ni primatelja.

begin;

create or replace function public.guard_friend_request_blocked_pair()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'UPDATE' and (
    new.sender_id is distinct from old.sender_id
    or new.recipient_id is distinct from old.recipient_id
  ) then
    raise exception 'Pošiljatelj i primatelj zahtjeva ne mogu se naknadno mijenjati.'
      using errcode = '42501';
  end if;

  if new.sender_id = new.recipient_id then
    raise exception 'Zahtjev za prijateljstvo nije moguće poslati samome sebi.'
      using errcode = '23514';
  end if;

  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and (
    new.sender_id is distinct from old.sender_id
    or new.recipient_id is distinct from old.recipient_id
    or (new.status = 'accepted' and old.status is distinct from 'accepted')
  )) then
    if exists (
      select 1
      from public.blocked_users as b
      where (b.blocker_id = new.sender_id and b.blocked_id = new.recipient_id)
         or (b.blocker_id = new.recipient_id and b.blocked_id = new.sender_id)
    ) then
      raise exception 'Zahtjev za prijateljstvo nije dopušten jer je između članova aktivna blokada.'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists community_friend_requests_blocked_pair_insert
  on public.community_friend_requests;
create trigger community_friend_requests_blocked_pair_insert
before insert on public.community_friend_requests
for each row
execute function public.guard_friend_request_blocked_pair();

drop trigger if exists community_friend_requests_blocked_pair_accept
  on public.community_friend_requests;
create trigger community_friend_requests_blocked_pair_accept
before update of status, sender_id, recipient_id on public.community_friend_requests
for each row
execute function public.guard_friend_request_blocked_pair();

-- Trigger funkcija ne treba biti izravno pozivljiva kroz klijentski API.
revoke all on function public.guard_friend_request_blocked_pair() from public, anon, authenticated;

commit;
