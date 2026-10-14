-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — pregledati i testirati prije primjene.
-- Blokira reakcije između članova koji su se blokirali, uključujući INSERT i UPDATE.
-- Oslanja se na postojeću tablicu private_message_reactions(message_id, user_id, emoji).

begin;

create or replace function public.prevent_private_message_reaction_between_blocked_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_sender_id uuid;
  v_recipient_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Za reakciju je potrebna prijava.'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' then
    -- Ne dopusti preuzimanje tuđe reakcije niti premještanje reakcije na drugu poruku.
    if old.user_id is distinct from auth.uid()
       or new.user_id is distinct from old.user_id
       or new.message_id is distinct from old.message_id then
      raise exception 'Vlasnik reakcije i poruka ne mogu se promijeniti.'
        using errcode = '42501';
    end if;
  elsif new.user_id is distinct from auth.uid() then
    raise exception 'Reakciju može dodati samo prijavljeni član za vlastiti račun.'
      using errcode = '42501';
  end if;

  select pm.sender_id, pm.recipient_id
    into v_sender_id, v_recipient_id
  from public.private_messages pm
  where pm.id = new.message_id;

  if not found then
    raise exception 'Privatna poruka nije pronađena.'
      using errcode = '23503';
  end if;

  if new.user_id is distinct from v_sender_id
     and new.user_id is distinct from v_recipient_id then
    raise exception 'Reakciju mogu dodati samo sudionici razgovora.'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.blocked_users b
    where (b.blocker_id = v_sender_id and b.blocked_id = v_recipient_id)
       or (b.blocker_id = v_recipient_id and b.blocked_id = v_sender_id)
  ) then
    raise exception 'Reakcija nije dopuštena jer je između članova aktivna blokada.'
      using errcode = '42501';
  end if;

  return new;
end;
$function$;

drop trigger if exists private_message_reactions_prevent_blocked_pair
  on public.private_message_reactions;

create trigger private_message_reactions_prevent_blocked_pair
before insert or update on public.private_message_reactions
for each row
execute function public.prevent_private_message_reaction_between_blocked_users();

revoke all on function public.prevent_private_message_reaction_between_blocked_users()
  from public, anon, authenticated;

commit;
