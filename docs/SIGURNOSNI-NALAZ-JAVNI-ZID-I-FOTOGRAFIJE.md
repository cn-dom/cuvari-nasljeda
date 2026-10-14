# Sigurnosni pregled: javna vidljivost zida i fotografija

Datum provjere: 2026-10-14  
Supabase projekt pregledan samo čitanjem: `azerctpwfzdivydsxyex`.

## Potvrđeni nalazi

1. Tablice `public.posts`, `public.comments` i `public.profiles` imaju SELECT politike za `anon, authenticated` s uvjetom `true`. To znači da RLS trenutno dopušta javno čitanje tih redaka.
2. Storage bucket `community-images` ima `public = true`, a politika `community_images_read_public` dopušta SELECT ulogama `anon, authenticated`. Objekti se zato ne mogu smatrati privatnima; samo RLS nije dovoljna zaštita za javni bucket.
3. Bucket `avatars` također ima javno čitanje kroz politiku `quiz_avatars_read_public`. Kviz sprema javni URL u `profiles.avatar_url`, a društvena mreža izravno prikazuje `avatar_url`. Privatizirati taj bucket bez izmjene koda kviza i društvene mreže moglo bi pokvariti prikaz profilnih fotografija.
4. U provjerenom popisu triggera tablice `private_messages` postoji trigger za obavijest, ali nije pronađen trigger `private_messages_prevent_blocked_pair` iz nacrta `docs/sql/private-message-block-guard.sql`. Zato se ne smije pretpostaviti da je zaštita privatnih poruka nakon blokade aktivna u bazi.
5. Nacrt `docs/sql/member-only-wall-access.sql` uklanja javne SELECT politike za zid i postavlja `community-images` na privatni. To još ne znači da su promjene primijenjene na aktivnu bazu.

## Važna razlika između fotografija

- **Fotografije uz objave:** aplikacija koristi potpisane URL-ove iz bucketa `community-images`; taj bucket može se privatizirati nakon testiranja migracije i provjere učitavanja.
- **Profilne fotografije:** trenutačno koriste javni bucket `avatars` i vrijednost `profiles.avatar_url`. Zasad ne mijenjati taj bucket u privatni bez zasebnog plana za generiranje potpisanih URL-ova u kvizu i društvenoj mreži, te provjere svih mjesta koja prikazuju avatar.
- Privatizacija tablice profila sama po sebi ne čini već javno dostupne URL-ove slika privatnima.

## Preporučeni redoslijed

1. Potvrditi da zid, komentari i fotografije uz objave trebaju biti dostupni samo prijavljenim članovima, a profilne fotografije ostaju javne dok se ne doradi njihovo posluživanje.
2. Napraviti izvoz/backup trenutnih RLS politika i potvrditi da frontend koristi potpisane URL-ove za fotografije uz objave.
3. U zasebnom testnom Supabase projektu primijeniti i testirati `docs/sql/member-only-wall-access.sql`.
4. U testnom projektu primijeniti i testirati `docs/sql/private-message-block-guard.sql`.
5. Provjeriti anonimni pristup, pristup prijavljenog člana, učitavanje fotografija objava i avatara, učitavanje profila te blokiranje poruka prije promjene produkcije.

## Važno

Ovaj dokument bilježi nalaze pregleda; nije potvrda da su promjene primijenjene. Tijekom pregleda nisu mijenjane shema, RLS politike, triggeri ni Storage postavke u Supabaseu. Prije primjene migracija treba potvrditi ciljano okruženje i provjeriti da aplikacija ne ovisi o javnom pristupu koji će se ukloniti.
