-- Enforce blocks in the database, not only in the UI.
-- If the caller is not one of the two participants, fail closed.
CREATE OR REPLACE FUNCTION private.community_users_blocked(p_user_a uuid, p_user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
SET row_security TO 'off'
AS $function$
  select
    auth.uid() is null
    or auth.uid() not in (p_user_a, p_user_b)
    or exists (
      select 1
      from public.blocked_users b
      where (b.blocker_id = p_user_a and b.blocked_id = p_user_b)
         or (b.blocker_id = p_user_b and b.blocked_id = p_user_a)
    );
$function$;

REVOKE ALL ON FUNCTION private.community_users_blocked(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.community_users_blocked(uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS private_messages_insert_sender ON public.private_messages;
CREATE POLICY private_messages_insert_sender ON public.private_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = (select auth.uid())
  AND recipient_id <> (select auth.uid())
  AND char_length(trim(body)) BETWEEN 1 AND 2000
  AND NOT private.community_users_blocked(sender_id, recipient_id)
);

DROP POLICY IF EXISTS private_messages_update_sender ON public.private_messages;
CREATE POLICY private_messages_update_sender ON public.private_messages
FOR UPDATE TO authenticated
USING (
  sender_id = (select auth.uid())
  AND NOT private.community_users_blocked(sender_id, recipient_id)
)
WITH CHECK (
  sender_id = (select auth.uid())
  AND recipient_id <> (select auth.uid())
  AND char_length(trim(body)) BETWEEN 1 AND 2000
  AND NOT private.community_users_blocked(sender_id, recipient_id)
);

DROP POLICY IF EXISTS "Members can send own friend requests" ON public.community_friend_requests;
CREATE POLICY "Members can send own friend requests" ON public.community_friend_requests
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = (select auth.uid())
  AND status = 'pending'
  AND recipient_id <> (select auth.uid())
  AND NOT private.community_users_blocked(sender_id, recipient_id)
);

DROP POLICY IF EXISTS "Recipients can respond to friend requests" ON public.community_friend_requests;
CREATE POLICY "Recipients can respond to friend requests" ON public.community_friend_requests
FOR UPDATE TO authenticated
USING (
  recipient_id = (select auth.uid())
  AND status = 'pending'
  AND NOT private.community_users_blocked(sender_id, recipient_id)
)
WITH CHECK (
  recipient_id = (select auth.uid())
  AND status IN ('accepted','declined')
  AND NOT private.community_users_blocked(sender_id, recipient_id)
);
