-- Point 3: centralize moderation authorization in the database.
-- Owner access is tied to the verified Supabase Auth email claim; role-based
-- access is read from profiles, whose role column is not client-writable.

CREATE OR REPLACE FUNCTION private.is_community_moderator()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
SET row_security TO 'off'
AS $function$
  select
    auth.uid() is not null
    and (
      lower(coalesce(auth.jwt() ->> 'email', '')) = 'patriasoul@protonmail.com'
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role in ('admin', 'moderator')
      )
    );
$function$;

REVOKE ALL ON FUNCTION private.is_community_moderator() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_community_moderator() TO authenticated;

-- Reports: only their author can submit; moderation reads/updates require
-- verified owner/admin/moderator authorization and valid workflow statuses.
DROP POLICY IF EXISTS owner_select_content_reports ON public.content_reports;
CREATE POLICY owner_select_content_reports ON public.content_reports
FOR SELECT TO authenticated
USING (private.is_community_moderator());

DROP POLICY IF EXISTS owner_update_content_reports ON public.content_reports;
CREATE POLICY owner_update_content_reports ON public.content_reports
FOR UPDATE TO authenticated
USING (private.is_community_moderator())
WITH CHECK (
  private.is_community_moderator()
  AND status IN ('pending', 'reviewed', 'dismissed', 'actioned')
);

-- Moderators may remove content that violates the rules. Authors retain the
-- existing right to remove their own posts/comments.
DROP POLICY IF EXISTS posts_delete_own ON public.posts;
CREATE POLICY posts_delete_own ON public.posts
FOR DELETE TO authenticated
USING (
  author_id = (select auth.uid())
  OR private.is_community_moderator()
);

DROP POLICY IF EXISTS comments_delete_own ON public.comments;
CREATE POLICY comments_delete_own ON public.comments
FOR DELETE TO authenticated
USING (
  author_id = (select auth.uid())
  OR private.is_community_moderator()
);

-- The audit trail is visible only to authorized moderation staff.
DROP POLICY IF EXISTS admin_audit_log_owner_read ON public.admin_audit_log;
CREATE POLICY admin_audit_log_owner_read ON public.admin_audit_log
FOR SELECT TO authenticated
USING (private.is_community_moderator());

-- Log writes must be authorized server-side too, not just hidden in the UI.
CREATE OR REPLACE FUNCTION private.admin_log_event(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_summary text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  new_id bigint;
begin
  if not private.is_community_moderator() then
    raise exception 'Nemaš moderatorske ovlasti.' using errcode = '42501';
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
$function$;

REVOKE ALL ON FUNCTION private.admin_log_event(text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.admin_log_event(text,text,text,text) TO authenticated;
