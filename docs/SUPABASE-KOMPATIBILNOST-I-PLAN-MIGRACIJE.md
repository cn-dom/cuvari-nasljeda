# Supabase — matrica kompatibilnosti i siguran plan

**Status: analiza bez promjena u bazama.** Ovaj dokument bilježi pregled shema dostupnih 13. listopada 2026. Ne predstavlja odobrenje za primjenu SQL-a u produkciji.

## Sažetak odluke

Preporuka je da se **projekt `kviz` (`ijimozjfdffejbczwyzb`) razmotri kao prvi kandidat za kanonsku bazu**, jer već sadrži glavni skup kviz-podataka i postojeće profile/objave zajednice. To još nije konačna odluka: prije promjene aplikacije treba potvrditi koji URL trenutačno koristi aktivni Cloudflare Worker i razjasniti koje postojeće korisničke račune treba sačuvati.

Ne stvarati treći Supabase projekt i ne kopirati tablice naslijepo. Nije izvršena nijedna migracija niti je promijenjena postavka Cloudflarea.

## Provjereno stanje

| Područje | `Patriasoul's Project` — `azerctpwfzdivydsxyex` | `kviz` — `ijimozjfdffejbczwyzb` |
|---|---|---|
| Profil | `profiles`: `id, username, display_name, bio, avatar_path, created_at, updated_at`; pregledani redci: 0 | `profiles`: `id, display_name, created_at, updated_at, role, avatar_url`; redci: 2 |
| Društveni zid | `posts`, `comments`, `post_reactions`, `blocked_users` postoje; pregledani redci u `posts`, `comments`: 0 | `community_posts` i povezane tablice postoje; `community_posts`: 4, `community_post_comments`: 1 |
| Privatne poruke | `private_messages(sender_id, recipient_id, body, reply_to_id, ...)` — oblik koji očekuje društveni dio aplikacije | `private_messages(conversation_id, sender_id, body, ...)` — model razgovora; **nekompatibilno s istim nazivom u društvenom dijelu** |
| Kviz | Kviz-tablice i provjerene kviz RPC funkcije nedostaju | `quiz_questions`: 2.000; `cities`: 128; `city_questions`: približno 9.600; kviz-tablice i provjerene kviz RPC funkcije postoje |
| Profilna polja kviza | Nedostaju `role` i `avatar_url` | Postoje `role` i `avatar_url`, ali nedostaju `username`, `bio`, `avatar_path` iz društvenog modela |

Brojevi redaka su trenutačni rezultat upita, ne jamstvo da su tablice potpune ili da ne postoje drugi podaci u Authu, Storageu ili drugim tablicama.

## Što kod očekuje

- Društveni dio u `src/lib/supabase.js` i `src/App.jsx` koristi jedan Supabase klijent i očekuje društvenu shemu: profile, objave, komentare, reakcije, blokade i izravne poruke.
- `kviz/src/lib/supabase.js` izričito ponovno izvozi isti klijent. Zato oba dijela dijele **jedan URL projekta i jednu Auth sesiju**.
- Kviz koristi `profiles`, `player_progress`, `quiz_results`, `quiz_questions`, `quiz_questions_public`, `cities`, `city_questions_public`, komentare/obavijesti zajednice i RPC funkcije za pokušaje, rezultate, ljestvicu i administraciju.
- Kvizov modul zajednice poziva `community_comments` i `community_notifications`. Njihovo postojanje i relacije treba posebno potvrditi prije završne integracije; `community_post_comments` nije isto što i `community_comments`.

## Predloženi redoslijed rada

1. **Potvrditi aktivni Worker**: samo očitati `VITE_SUPABASE_URL` iz konfiguracije Cloudflare Workers/Build variables. Ne prikazivati niti zapisivati publishable/secret ključeve u repozitorij ili izvještaj.
2. **Potvrditi ciljnu bazu** i Auth račune koje treba sačuvati. Auth korisnici i sesije ne sele se automatski samo kopiranjem tablice `profiles`.
3. Ako se potvrdi `kviz` kao kanonska baza, napraviti novu migraciju koja dodaje nedostajuća polja profila uz očuvanje `role` i `avatar_url`; dodaje odvojene društvene tablice; provjerava RLS, indekse, FK-ove i Storage pravila.
4. **Ne preimenovati niti prepisivati postojeći `private_messages`**. Ili prilagoditi društveni UI modelu razgovora koji već postoji, ili uvesti jasno odvojenu tablicu za izravne poruke i promijeniti sve pozive u kodu.
5. Uskladiti komentare kviza i komentare objava: zasebno dokumentirati `community_comments` i `community_post_comments`; ne spajati ih samo zato što imaju slične nazive.
6. Provjeriti svaku kviz RPC funkciju, njezin potpis, privilegije izvršavanja, `search_path`, provjere administratorskih prava i RLS. Ne kopirati funkcije bez pregleda izvornog SQL-a.
7. Testirati na razvojnoj grani/bazi: registracija, prijava i OAuth, objava/komentar/reakcija, poruke, kviz, gradovi, rezultati, ljestvica i administratorske akcije.
8. Tek nakon prolaza testova pripremiti zaseban PR i plan povratka. Produkcijsku bazu i Worker mijenjati tek nakon izričitog odobrenja.

## Sigurnosne zapreke prije migracije

- Ne stavljati `service_role`/secret ključ u `VITE_*` varijable.
- Ne uklanjati ili širiti postojeće RLS politike bez provjere svih operacija i korisničkih uloga.
- Ne pretpostaviti da su dva projekta isti identitetni prostor: `auth.users` i sesije pripadaju pojedinom projektu.
- Ne izvršavati postojeće datoteke `docs/sql/*.sql` automatski. Neke su nacrti i mogu mijenjati politike, okidače ili Storage.

## Zaključak

Najmanje rizičan put vjerojatno je zadržati kviz-podatke u projektu `kviz` i u njega pažljivo dodati/uklopiti društvenu shemu, ali to se ne smije pokrenuti prije potvrde aktivnog Worker URL-a i plana za postojeće Auth račune. Trenutačno je ovo plan kompatibilnosti — ne primijenjena migracija.
