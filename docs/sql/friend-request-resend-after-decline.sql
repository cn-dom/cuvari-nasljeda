-- PatriaSoul – Čuvari nasljeđa
-- SIGURNOSNI SQL NACRT — pregledati i testirati prije primjene.
-- Omogućuje ponovno slanje zahtjeva nakon što je raniji zahtjev odbijen
-- ili je postao declined zbog blokiranja. Čuva povijest starih zahtjeva.
-- Ne izvršavati na produkcijskoj bazi bez testiranja i provjere naziva ograničenja.

begin;

-- Trenutačna osnovna shema ima UNIQUE(sender_id, recipient_id), što trajno
-- blokira novo slanje čak i nakon statusa declined. Uklanjamo samo to
-- ograničenje i zamjenjujemo ga jedinstvenošću aktivnih zahtjeva na čekanju.
alter table public.community_friend_requests
  drop constraint if exists community_friend_requests_sender_id_recipient_id_key;

create unique index if not exists community_friend_requests_one_pending_direction_idx
  on public.community_friend_requests (sender_id, recipient_id)
  where status = 'pending';

-- Zaštita za slučaj da je migracija primijenjena nakon što su se pojavili
-- duplikati zahtjeva na čekanju: prije indeksa bi ih trebalo pregledati ručno.
-- Ne brišemo povijesne prihvaćene ili odbijene zahtjeve.

commit;
