-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — NE IZVRŠAVATI NA PRODUKCIJSKOJ BAZI BEZ TESTA.
-- Provjera blokiranih članova na razini baze. UI filtri nisu sigurnosna granica.
-- Ako je bilo koja strana blokirala drugu, nova privatna poruka se odbija.

begin;

create or replace function public.prevent_private_message_between_blocked_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
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
before insert on public.private_messages
for each row
execute function public.prevent_private_message_between_blocked_users();

-- Trigger izvršava funkciju bez potrebe da je član izravno poziva.
-- Ukloni zadane EXECUTE ovlasti za javne/klijentske uloge.
revoke all on function public.prevent_private_message_between_blocked_users() from public, anon, authenticated;

commit;
