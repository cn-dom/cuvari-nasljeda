-- Hrvatski Val: public likes and authenticated community comments.
create table if not exists public.music_track_likes (
  track_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (track_id, user_id),
  constraint music_track_likes_track_id_length check (char_length(track_id) between 6 and 80)
);
create table if not exists public.music_track_comments (
  id uuid primary key default gen_random_uuid(),
  track_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1200),
  created_at timestamptz not null default now(),
  constraint music_track_comments_track_id_length check (char_length(track_id) between 6 and 80)
);
create index if not exists music_track_comments_track_created_idx on public.music_track_comments(track_id, created_at desc);

alter table public.music_track_likes enable row level security;
alter table public.music_track_comments enable row level security;

drop policy if exists "Anyone can read music likes" on public.music_track_likes;
create policy "Anyone can read music likes" on public.music_track_likes for select to anon, authenticated using (true);
drop policy if exists "Members can like music" on public.music_track_likes;
create policy "Members can like music" on public.music_track_likes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Members can remove own music likes" on public.music_track_likes;
create policy "Members can remove own music likes" on public.music_track_likes for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Anyone can read music comments" on public.music_track_comments;
create policy "Anyone can read music comments" on public.music_track_comments for select to anon, authenticated using (true);
drop policy if exists "Members can comment on music" on public.music_track_comments;
create policy "Members can comment on music" on public.music_track_comments for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Members can delete own music comments" on public.music_track_comments;
create policy "Members can delete own music comments" on public.music_track_comments for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.music_track_likes, public.music_track_comments to anon, authenticated;
grant insert, delete on public.music_track_likes to authenticated;
grant insert, delete on public.music_track_comments to authenticated;
