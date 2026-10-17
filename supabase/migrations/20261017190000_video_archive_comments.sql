-- Shared comments for PatriaSoul's embedded video archive.
-- Only signed-in members can read or create comments; members can only post as themselves.
create table if not exists public.video_archive_comments (
  id uuid primary key default gen_random_uuid(),
  video_id text not null check (char_length(video_id) between 6 and 64),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 1500),
  created_at timestamptz not null default now()
);

create index if not exists video_archive_comments_video_created_idx
  on public.video_archive_comments (video_id, created_at asc);

alter table public.video_archive_comments enable row level security;

drop policy if exists video_archive_comments_read_members on public.video_archive_comments;
create policy video_archive_comments_read_members
  on public.video_archive_comments
  for select
  to authenticated
  using (true);

drop policy if exists video_archive_comments_insert_own on public.video_archive_comments;
create policy video_archive_comments_insert_own
  on public.video_archive_comments
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert on table public.video_archive_comments to authenticated;
revoke all on table public.video_archive_comments from anon;
