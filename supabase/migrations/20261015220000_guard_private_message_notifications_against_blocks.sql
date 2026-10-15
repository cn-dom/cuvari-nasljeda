-- Defense in depth: do not create private-message notifications if either member has blocked the other.
-- The private_messages RLS policy already rejects blocked conversations; this trigger guard
-- also prevents notification side effects if message-write paths change in the future.
CREATE OR REPLACE FUNCTION public.notify_private_message_recipient()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
begin
  if exists (
    select 1
      from public.blocked_users b
     where (b.blocker_id = new.sender_id and b.blocked_id = new.recipient_id)
        or (b.blocker_id = new.recipient_id and b.blocked_id = new.sender_id)
  ) then
    return new;
  end if;

  insert into public.notifications (
    recipient_id, actor_id, type, title, body, reference_id
  )
  values (
    new.recipient_id,
    new.sender_id,
    'private_message',
    'Nova privatna poruka',
    left(trim(new.body), 240),
    new.id
  );

  return new;
end;
$function$;
