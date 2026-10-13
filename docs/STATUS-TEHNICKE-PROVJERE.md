# Tehnička provjera — Čuvari nasljeđa

Datum provjere: 13. listopada 2026.

## Sažetak

- Repozitorij: `cn-dom/cuvari-nasljeda`.
- Zadnji provjereni commit na `main`: `1dc926c9c7f311d23fbd3e9068f8f20259b6c343`.
- GitHub Actions build za taj commit: **uspješan**.
- Build status ne potvrđuje ispravnost konfiguracije Cloudflarea, Supabase veze ili ponašanja aplikacije u pregledniku.
- U `src/lib/supabase.js` glavni portal i kviz koriste jedan Supabase klijent i time jednu bazu/autentifikacijsku sesiju.

## Važno otkriće: sheme su u dva projekta

U dostupnim Supabase projektima pronađene su dvije različite skupine tablica:

### Projekt `Patriasoul's Project`

Sadrži društvenu jezgru koju trenutačni `src/App.jsx` koristi, uključujući:

- `profiles`
- `posts`
- `comments`
- `post_reactions`
- `blocked_users`
- `content_reports`
- `private_messages`
- `private_message_reactions`
- `group_chats`
- `group_chat_members`
- `group_chat_messages`
- `group_chat_message_reads`
- `notifications`
- `group_chat_message_reactions`

Sve gore navedene tablice koje su pregledane imaju uključen RLS. To samo po sebi ne dokazuje da su pojedinačne politike sigurne ili da sve funkcije rade.

### Projekt `kviz`

Sadrži kviz podatke i funkcije, uključujući tablice `quiz_results`, `player_progress`, `player_badges`, `cities`, `city_questions` i `profiles`, uz dodatne community/forum tablice i RPC funkcije. Pregled je pokazao približno 128 gradova i 9.600 pitanja za gradove.

## Zašto je to blokator

Kviz uvozi isti Supabase klijent kao društvena mreža. Jedna vrijednost `VITE_SUPABASE_URL` ne može istodobno usmjeravati pozive na oba odvojena projekta. Ako aplikacija koristi projekt s društvenim tablicama, kviz može ostati bez svojih tablica/pitanja; ako koristi projekt kviza, glavni zid može tražiti drukčije tablice od onih koje su u tom projektu dostupne.

U repozitoriju nije pronađena mapa `supabase/migrations` koja bi omogućila jednostavno potvrditi da je cijela trenutačna shema reproducibilna iz verzioniranih migracija. To ne znači da migracije ne postoje u samoj bazi; znači da nisu dostupne na očekivanoj putanji u repozitoriju.

## Siguran plan popravka

1. **Ne mijenjati bazu dok se ne potvrdi projekt koji trenutačna Cloudflare aplikacija stvarno koristi.**
2. U Cloudflare postavkama provjeriti samo naziv/URL vrijednosti `VITE_SUPABASE_URL` (ne dijeliti tajne ključeve).
3. Odabrati jedan kanonski Supabase projekt za portal i kviz.
4. Usporediti sve potrebne tablice, poglede, RPC funkcije, RLS politike, trigger funkcije i Storage buckete između aplikacijskog koda i ciljnog projekta.
5. Pripremiti verzionirane migracije za nedostajuće objekte. Ne prepisivati postojeće tablice i ne uvoziti podatke bez sigurnosne kopije i provjere konflikata.
6. Pokrenuti build, zatim testirati prijavu, kviz, zid, komentare, reakcije, upload slike i grupne poruke s dva testna računa.
7. Pregledati Supabase Security Advisor upozorenja. Ne uklanjati `EXECUTE` prava naslijepo: svaku `SECURITY DEFINER` funkciju treba prvo provjeriti zbog njezine namjene i unutarnje provjere ovlasti.

## Sigurnosna upozorenja

Supabase Security Advisor prikazuje upozorenja za više `SECURITY DEFINER` funkcija i za isključenu zaštitu od poznatih kompromitiranih lozinki. Upozorenja treba pregledati pojedinačno. Nije sigurno naslijepo ukinuti prava funkcijama koje aplikacija legitimno koristi, ali ni pretpostaviti da je dovoljno sakriti administratorske gumbe u sučelju.

## Što još nije potvrđeno

- Koji je točno Supabase URL postavljen u aktivnom Cloudflare Workeru.
- Koji je URL aktivne aplikacije i prikazuje li se bez bijelog zaslona.
- Postoji li i je li ispravno konfiguriran Storage bucket `community-images`.
- Jesu li Auth redirect URL-ovi postavljeni za glavnu aplikaciju i `/kviz/`.
- Jesu li sve politike RLS i prava RPC funkcija provjerena s korisnicima različitih uloga.
- Jesu li grupe, poruke i ostale značajke funkcionalno testirane u objavljenoj aplikaciji.

Ovaj dokument bilježi rezultate pregleda i ne mijenja nijednu Supabase bazu niti Cloudflare konfiguraciju.
