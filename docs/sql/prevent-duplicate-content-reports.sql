-- PatriaSoul · Čuvari nasljeđa
-- Sprječava višestruke istovjetne prijave istog člana za istu objavu
-- dok je prethodna prijava još na čekanju.
--
-- Član može ponovno prijaviti istu objavu nakon što je prethodna prijava
-- pregledana, odbačena ili obrađena.
create unique index if not exists content_reports_one_pending_per_reporter_post
  on public.content_reports (reporter_id, post_id)
  where status = 'pending' and post_id is not null;
