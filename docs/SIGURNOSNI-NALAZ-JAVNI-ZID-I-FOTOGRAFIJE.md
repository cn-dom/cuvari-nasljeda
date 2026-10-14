# Sigurnosni pregled: javna vidljivost zida i fotografija

Datum provjere: 2026-10-14  
Supabase projekt pregledan samo čitanjem: `azerctpwfzdivydsxyex`.

## Potvrđeni nalazi

1. Tablice `public.posts`, `public.comments` i `public.profiles` imaju SELECT politike za `anon, authenticated` s uvjetom `true`. To znači da RLS trenutno dopušta javno čitanje tih redaka.
2. Storage bucket `community-images` ima `public = true`. U njemu se objekti mogu dohvatiti javnim URL-ovima; RLS nad objektima nije dovoljna zaštita za javni bucket.
3. U provjerenom popisu triggera tablice `private_messages` postoji trigger za obavijest, ali nije pronađen trigger `private_messages_prevent_blocked_pair` iz nacrta `docs/sql/private-message-block-guard.sql`. Zato se ne smije pretpostaviti da je zaštita privatnih poruka nakon blokade aktivna u bazi.
4. Postojeći nacrt `docs/sql/member-only-wall-access.sql` već predviđa uklanjanje javnih SELECT politika, ograničenje čitanja na prijavljene članove i postavljanje bucketa `community-images` na privatni. Trenutačne live postavke ne odgovaraju tom nacrtu.

## Preporučeni redoslijed

1. Potvrditi da je cilj i dalje da zid i fotografije zida budu dostupni samo prijavljenim članovima.
2. Napraviti izvoz/backup trenutnih RLS politika i potvrditi da frontend koristi potpisane URL-ove za fotografije.
3. U testnom Supabase projektu primijeniti i testirati `docs/sql/member-only-wall-access.sql`.
4. Primijeniti i testirati `docs/sql/private-message-block-guard.sql` u testnom projektu.
5. Provjeriti anonimni pristup, pristup prijavljenog člana, učitavanje fotografija, učitavanje profila i blokiranje poruka prije promjene produkcije.

## Važno

Ovaj dokument je nalaz pregleda, ne potvrda da su promjene primijenjene. Tijekom pregleda nije izvršena promjena sheme, RLS politika, triggera ni Storage postavki u Supabaseu. Prije primjene treba provjeriti da navedeni projekt jest odgovarajuće testno okruženje i da aplikacija ne ovisi o javnom pristupu.
