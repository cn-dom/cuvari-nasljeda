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


## Dodatna provjera baze — 13. listopada 2026.

Provedena je i provjera stvarnih tablica te deset RPC funkcija koje kviz navodi u integracijskom inventaru.

### Potvrđeni rezultati

| Objekt | `Patriasoul's Project` | `kviz` |
|---|---|---|
| Društvene tablice koje koristi glavni zid (`posts`, `comments`, `post_reactions`) | postoje, trenutačno 0 redaka | nisu prisutne pod tim nazivima |
| Kviz tablice `quiz_results`, `player_progress`, `player_badges` | nisu prisutne | postoje |
| `cities` / `city_questions` / `quiz_questions` | nisu prisutne | postoje: 128 gradova, 9.600 gradskih pitanja, 2.000 kviznih pitanja |
| Kviz RPC funkcije iz integracijskog inventara | nije pronađena nijedna od 10 provjeravanih funkcija | pronađeno svih 10 |
| Dodatne društvene objave `community_posts` | nisu prisutne | postoje: 4 objave i 1 komentar |
| Migracije zabilježene u bazi | 6 | 33 |

Brojevi redaka i popis migracija odražavaju stanje u trenutku provjere; nisu jamstvo da će stanje ostati isto.

### Važna korekcija plana

Nije sigurno samo kopirati tablice iz jednog projekta u drugi. Oba projekta imaju tablicu `profiles`, ali njihove sheme i povezane tablice nisu iste. Projekt `kviz` također već ima tablice `private_messages` i druge objekte koji se razlikuju od društvenog modela. Jednostavno pokretanje društvenih migracija nad projektom kviza može pasti zbog sukoba naziva ili, još gore, napraviti nekompatibilne promjene.

Zato se trenutačno **ne preporučuje automatski prijenos cijele baze niti promjena produkcijskog URL-a**. Prvo treba odabrati strategiju i mapirati tablice, RPC-je, profile, korisničke ID-jeve, Storage i RLS.

### Sigurnije opcije za odluku

1. **Jedna baza — migrirati društvenu jezgru u projekt `kviz`.** Čuva postojeće kvizne podatke i RPC-je, ali zahtijeva pažljivo usklađivanje `profiles`, poruka i ostalih tablica koje se preklapaju ili imaju drukčiju strukturu.
2. **Jedna baza — migrirati kviz u `Patriasoul's Project`.** Zadržava društvenu shemu kao polazište, ali zahtijeva prijenos kviznih tablica, 10 RPC funkcija, pogleda, triggera, pravila i podataka te provjeru korisničkih profila.
3. **Dvije baze.** Moguće je koristiti dva klijenta, ali prijava i ovlasti ne postaju automatski zajedničke. Bez dodatne arhitekture član bi mogao trebati odvojenu sesiju, a korisnički ID iz jednog projekta nije automatski korisnik drugog projekta. To nije preporučeni prečac za željeno jedinstveno iskustvo prijave.

### Sljedeći tehnički koraci

- Pregledati izvorni SQL migracija kviza i društvenog dijela te usporediti definicije `profiles`, poruka, komentara, reakcija i triggera.
- Usporediti Storage buckete i RLS politike, ne samo postojanje tablica.
- Pripremiti migracije koje su verzionirane u repozitoriju i ne brišu postojeće podatke.
- Prije primjene napraviti backup i pokrenuti migracije na razvojnoj kopiji; tek nakon testova razmatrati produkciju.
- Nakon potvrde ciljnog projekta ažurirati varijable za build/deploy i testirati prijavu, kviz, objave, komentare, reakcije, fotografije, privatne i grupne poruke.

Ova dodatna provjera bila je samo čitanje metapodataka i popisa migracija. Nije izvršena nijedna DDL/DML promjena u Supabaseu niti je promijenjena Cloudflare konfiguracija.


### Usporedba profila i privatnih poruka

Dodatno je potvrđeno da se razlike odnose i na stupce, ne samo na nazive tablica:

- U `Patriasoul's Project`, `profiles` sadrži `username`, `display_name`, `bio` i `avatar_path`.
- U projektu `kviz`, `profiles` sadrži `display_name`, `role` i `avatar_url`; ne sadrži iste profile stupce kao društvena jezgra.
- U `Patriasoul's Project`, `private_messages` koristi `sender_id`, `recipient_id`, `body` i opcionalni `reply_to_id`.
- U projektu `kviz`, `private_messages` koristi `conversation_id`, `sender_id` i `body`, a sudionici razgovora pohranjeni su u zasebnim tablicama.

Zato migracija mora biti **prilagodba modela i aplikacijskih upita**, a ne puko kopiranje SQL datoteke. Ne smijemo pretpostaviti da su `profiles` ili privatne poruke kompatibilne samo zato što imaju isti naziv.

URL-ovi dvaju projekata potvrđeni su iz Supabase upravljačkog sučelja:
- `Patriasoul's Project`: `https://azerctpwfzdivydsxyex.supabase.co`
- `kviz`: `https://ijimozjfdffejbczwyzb.supabase.co`

To **ne potvrđuje** koji je od njih ugrađen u trenutačno objavljeni Cloudflare build; to se mora provjeriti zasebno prije prebacivanja prometa.


## Dopuna — 15. listopada 2026.

Ovaj izvještaj bilježi stanje provjere od 13. listopada. Nakon te provjere u repozitoriju su dodane sigurnosne migracije za blokiranje interakcija i moderatorske ovlasti, a CI konfiguracija je usklađena s odabranim Supabase projektom. To **ne dokazuje** da aktivni Cloudflare Worker koristi isti URL; produkcijsku konfiguraciju i stvarno ponašanje aplikacije treba provjeriti odvojeno.

U administraciji kviza dodana je integracija s postojećim RPC funkcijama za statistiku i rezultate. Izgradnja i testovi provjeravaju sintaksu i isporuku aplikacije, ali ne zamjenjuju funkcionalni test s dva korisnička računa.

PR za zajedničke značke treba sadržavati verzioniranu migraciju i povezivanje kataloga s profilima, imenikom i virtualnim muzejom. Sama prisutnost tablice `heritage_badge_awards` nije dokaz da su svi prikazi i okidači dodjele znački povezani.

**Pravilo:** ne prebacivati Cloudflare URL, ne kopirati korisničke podatke i ne pokretati migracije naslijepo. Prije promjene produkcije potvrditi ciljnu bazu, sigurnosnu kopiju, shemu, RLS i stvarni rezultat testa.
