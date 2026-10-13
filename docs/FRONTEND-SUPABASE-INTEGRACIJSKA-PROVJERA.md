# Integracijska provjera: frontend i Supabase

Datum provjere: 2026-10-13

## Sažetak

Kviz i društveni dio aplikacije u kodu koriste isti klijent iz `src/lib/supabase.js`. Kvizov `kviz/src/lib/supabase.js` samo ponovno izvozi taj klijent. To znači da obje cjeline u produkciji ovise o istim varijablama `VITE_SUPABASE_URL` i `VITE_SUPABASE_PUBLISHABLE_KEY`, te o jednoj Supabase instanci i njezinoj Auth sesiji.

## Provjerene veze

- `src/lib/supabase.js`: stvara klijenta samo kada su obje VITE varijable konfigurirane; u suprotnom aplikacija može ostati u prototipnom načinu rada.
- `kviz/src/lib/supabase.js`: ponovno izvozi isti klijent, pa kviz ne koristi zasebnu bazu.
- Kviz poziva RPC funkcije `record_quiz_result`, `get_leaderboard`, `start_quiz_attempt`, `submit_quiz_answer`, `admin_dashboard_stats`, `admin_list_users` i `create_community_notification`. Aktivna baza mora sadržavati odgovarajuće funkcije i kompatibilne tablice.
- Društveni dio očekuje profilna polja kao što su `display_name`, `username` i `avatar_url` u različitim dijelovima koda. Potrebno je potvrditi svako polje u odnosu na odabranu bazu prije promjene sheme.

## Potvrđeni rizik: privatne poruke

Frontend u `src/App.jsx` sluša promjene tablice `private_messages` filtrirane preko `recipient_id`. SQL nacrti `docs/sql/private-messages.sql`, `docs/sql/social-messaging-core.sql`, `docs/sql/private-message-reactions.sql` i `docs/sql/notifications.sql` također pretpostavljaju shemu s `recipient_id`.

Međutim, provjera postojeće baze `kviz` pokazala je da njezina tablica `private_messages` koristi model razgovora s `conversation_id`, `sender_id` i `body`, uz tablice sudionika razgovora. Zato navedene SQL nacrte ne treba izvršavati na toj bazi: `CREATE TABLE IF NOT EXISTS` ne preoblikuje postojeću tablicu, a indeksi, politike ili triggeri koji spominju `recipient_id` mogu pasti ili ostaviti neusklađenu implementaciju.

## Profil i uloge

Postojeće baze imaju različite profile. U bazi `kviz` profil koristi `display_name`, `role` i `avatar_url`; društveni projekt `Patriasoul's Project` ima zasebnu shemu s `username`, `bio` i `avatar_path`. Ne smije se pretpostaviti da su sheme međusobno zamjenjive.

Nacrt `docs/sql/quiz-profile-compat.sql` predlaže ograničenje uloga na `member/admin`, dok postojeći kviz koristi uloge `player/editor/admin`. Ne primjenjivati taj nacrt bez prilagodbe i provjere postojećih triggera koji štite promjene uloga.

## Siguran redoslijed sljedećih koraka

1. Utvrditi koja je Supabase adresa stvarno postavljena u Cloudflare Pages/Workers produkcijskom buildu; iz repozitorija se to ne može pouzdano zaključiti.
2. Odabrati kanonsku bazu na temelju toga gdje treba sačuvati korisničke račune, kviz sadržaj i društvene podatke.
3. Izraditi mapu frontend upita prema tablicama, stupcima, RPC-ovima i Realtime filtrima odabrane baze.
4. Za poruke odlučiti hoće li frontend prilagoditi postojeći model razgovora ili će se zasebno i planski migrirati poruke. Ne mijenjati produkcijsku shemu naslijepo.
5. Izvesti i testirati migracije u razvojnoj kopiji, uključujući RLS, uloge, prijavu, kviz i privatne poruke.
6. Tek nakon uspješnih testova i izričite potvrde odobriti produkcijsku primjenu.

## Što ova provjera nije napravila

Nije mijenjala bazu, RLS politike, korisničke uloge, Cloudflare varijable niti podatke. To je pregled kompatibilnosti koda i prethodno očitanih shema, ne potvrda da je produkcijska konfiguracija već ispravna.
