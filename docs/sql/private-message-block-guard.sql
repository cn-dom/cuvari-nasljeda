-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — NE IZVRŠAVATI NA PRODUKCIJSKOJ BAZI BEZ TESTA.
-- Provjera blokiranih članova na razini baze. UI filtri nisu sigurnosna granica.
-- Ako je bilo koja strana blokirala drugu, slanje i uređivanje privatne poruke se odbija.
-- Dodatno: zahtjev prijavljenog člana ne smije slati poruku pod tuđim sender_id.

begin;

create or replace function public.prevent_private_message_between_blocked_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  -- Dodatna obrana uz RLS: prijavljeni korisnik smije slati samo kao sam sebe.
  -- Ako auth.uid() nije NULL, radi se o korisničkoj sesiji; servisni pozivi
  -- bez korisničkog JWT-a i dalje se mogu kontrolirati na svojoj poslužiteljskoj strani.
  if (select auth.uid()) is not null
     and new.sender_id is distinct from (select auth.uid()) then
    raise exception 'Pošiljatelj poruke ne odgovara prijavljenom članu.'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.blocked_users as b
    where (b.blocker_id = new.sender_id and b.blocked_id = new.recipient_id)
       or (b.blocker_id = new.recipient_id and b.blocked_id = new.sender_id)
  ) then
    raise exception 'Privatna poruka nije dopuštena jer je između ovih članova aktivna blokada.'
      using errcode = '42501';
  end if;

  return new;
end;
$function$;

drop trigger if exists private_messages_prevent_blocked_pair on public.private_messages;
create trigger private_messages_prevent_blocked_pair
before insert or update on public.private_messages
for each row
execute function public.prevent_private_message_between_blocked_users();

-- Trigger izvršava funkciju bez potrebe da je član izravno poziva.
-- Ukloni zadane EXECUTE ovlasti za javne/klijentske uloge.
revoke all on function public.prevent_private_message_between_blocked_users() from public, anon, authenticated;

commit;

-- Nakon primjene u testnoj bazi provjeriti:
-- 1) normalna poruka prijavljenog člana prolazi;
-- 2) INSERT s tuđim sender_id ne prolazi;
-- 3) poruka između članova blokiranih u bilo kojem smjeru ne prolazi;
-- 4) odgovor na poruku i obavijest i dalje rade;
-- 5) privatne poruke i dalje su vidljive samo sudionicima prema postojećim RLS pravilima.
