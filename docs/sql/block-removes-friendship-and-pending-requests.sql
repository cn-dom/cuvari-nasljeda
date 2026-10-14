-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — pregledati i testirati prije primjene.
-- Kada član blokira drugoga:
--   1) uklanja se postojeća veza prijateljstva;
--   2) zahtjevi na čekanju u oba smjera označavaju se kao odbijeni;
--   3) pri budućim blokadama ista pravila vrijede automatski.
-- Ne brišu se profili, objave ni povijesni prihvaćeni zahtjevi.

begin;

create or replace function public.cleanup_friendship_after_block()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_low uuid;
  v_high uuid;
begin
  v_low := least(new.blocker_id, new.blocked_id);
  v_high := greatest(new.blocker_id, new.blocked_id);

  -- Ukloni kanonsku vezu prijateljstva, neovisno o smjeru blokade.
  delete from public.community_friendships
  where user_low = v_low
    and user_high = v_high;

  -- Poništi zahtjeve koji još čekaju odgovor u oba smjera.
  -- Povijesni prihvaćeni/odbijeni zahtjevi ostaju sačuvani.
  update public.community_friend_requests
  set status = 'declined'
  where status = 'pending'
    and (
      (sender_id = new.blocker_id and recipient_id = new.blocked_id)
      or
      (sender_id = new.blocked_id and recipient_id = new.blocker_id)
    );

  return new;
end;
$function$;

drop trigger if exists blocked_users_cleanup_friendship
  on public.blocked_users;

create trigger blocked_users_cleanup_friendship
after insert on public.blocked_users
for each row
execute function public.cleanup_friendship_after_block();

-- Funkcija služi samo okidaču; ne treba biti izravno pozivljiva kroz API.
revoke all on function public.cleanup_friendship_after_block()
  from public, anon, authenticated;

-- Jednokratno usklađivanje postojećih blokada:
-- uklanja prijateljstva i odbija samo zahtjeve koji su još na čekanju.
delete from public.community_friendships f
using public.blocked_users b
where f.user_low = least(b.blocker_id, b.blocked_id)
  and f.user_high = greatest(b.blocker_id, b.blocked_id);

update public.community_friend_requests r
set status = 'declined'
where r.status = 'pending'
  and exists (
    select 1
    from public.blocked_users b
    where (b.blocker_id = r.sender_id and b.blocked_id = r.recipient_id)
       or (b.blocker_id = r.recipient_id and b.blocked_id = r.sender_id)
  );

commit;
