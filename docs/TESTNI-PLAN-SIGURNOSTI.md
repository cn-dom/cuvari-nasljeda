# Testni plan sigurnosti — PatriaSoul · Čuvari nasljeđa

Ovo je kontrolni popis za odvojeni razvojni/testni Supabase projekt. **Ne predstavlja potvrdu da su pravila već testirana.** Ne primjenjivati na produkciju bez zasebne provjere i izričitog odobrenja.

## Prije testiranja

- [ ] Potvrđen je ID testnog projekta i provjereno da nije produkcija.
- [ ] SQL nacrt iz `docs/sql/community-core.sql` pregledan je prije primjene.
- [ ] Registrirana su dva testna člana, A i B, s odvojenim računima.
- [ ] U aplikaciji je postavljen samo Supabase URL i publishable/anon ključ; nema `service_role` ni tajnog ključa u pregledniku.
- [ ] Zabilježena je početna konfiguracija projekta kako bi se testni resursi mogli očistiti.

## Baza i RLS

| Test | Očekivani rezultat |
| --- | --- |
| Neprijavljeni korisnik čita javne profile, objave i komentare; ne može čitati popis reakcija ni identitete članova koji su reagirali | Čitanje je dopušteno; anonimni korisnik ne smije umetati, mijenjati ni brisati sadržaj. |
| Član A stvara profil/objavu/komentar/reakciju s vlastitim ID-jem | Dopušteno uz ispravne podatke i postojeći profil. |
| Član A šalje tuđi ID kao `author_id` ili `user_id` | Odbijeno pravilima RLS. |
| Član A pokušava urediti ili obrisati objavu/komentar člana B | Odbijeno; zapis člana B ostaje nepromijenjen. |
| Član A pokušava promijeniti vlasnika zapisa kroz UPDATE | Odbijeno pravilom `WITH CHECK`. |
| Tekst objave/komentara prelazi dopuštenu duljinu | Odbijeno ograničenjem baze. |
| Objavi se prazan tekst bez slike | Odbijeno ograničenjem baze. |

## Storage — fotografije

| Test | Očekivani rezultat |
| --- | --- |
| Član A učitava dopuštenu sliku u `<A-UUID>/...` | Dopušteno ako je datoteka valjana. |
| Član A učitava u mapu člana B | Odbijeno pravilom vlasništva. |
| Član A mijenja ili briše objekt člana B | Odbijeno pravilom vlasništva. |
| Neprijavljeni korisnik traži potpisani URL za sliku javne objave | Dopušteno samo za namjenski bucket `community-images`; anonimni upload, izmjena i brisanje ostaju zabranjeni. Privatne slike ne smiju se pohranjivati u taj bucket. |
| Datoteka je veća od 10 MB ili ima nepodržani MIME tip | Storage treba odbiti upload prema konfiguraciji bucketa. |
| Datoteka ima lažnu ekstenziju ili MIME zaglavlje | Aplikacijska/poslužiteljska provjera mora je odbiti; MIME postavka sama po sebi nije dokaz stvarnog formata. |
| Pokušaj zamjene objekta postojećim nazivom | Mora proći pravilo vlasništva i provjeru dopuštenih operacija; testirati ponašanje upsert-a zasebno. |

## Testni zapis

Za svaki test zabilježiti:
- datum i projekt (bez ključeva ili tokena),
- ulogu testnog računa (anoniman, A ili B),
- radnju i očekivani rezultat,
- stvarni rezultat i eventualnu poruku pogreške,
- prolaz/pad i poveznicu na ispravak.

Ne kopirati lozinke, access tokene, session JWT-ove ni tajne ključeve u zapis.

## Ograničenja trenutnog nacrta

- SQL je pregledni nacrt; nije primijenjen ni provjeren na stvarnom projektu.
- Storage politika čitanja dopušta svim prijavljenim članovima čitanje objekata u bucketu. To odgovara fotografijama zajednice, ali nije prikladno za privatne poruke ili privatne albume.
- Čišćenje fotografije nakon brisanja objave nije atomska transakcija; potreban je siguran proces čišćenja i provjera vlasništva.
- Prije javnog rada treba razmotriti prijavu sadržaja, blokiranje korisnika, moderiranje, ograničenje učestalosti i uklanjanje sadržaja.

## Privatne poruke i blokade

Ovaj dio provjerava nacrte `docs/sql/private-message-block-guard.sql` i `docs/sql/private-message-reaction-block-guard.sql`. Testirati samo u zasebnom Supabase testnom projektu nakon pregleda i primjene nacrta na tom projektu. Trenutačno se ne tvrdi da su ovi triggeri aktivni na produkciji.

| Test | Očekivani rezultat |
| --- | --- |
| Član A pošalje poruku članu B, bez blokade | Poruka se spremi; postojeća obavijest primatelju radi. |
| Član A pokuša poslati poruku s `sender_id` člana B | Odbijeno; identitet pošiljatelja mora odgovarati `auth.uid()`. |
| A blokira B pa pokuša poslati poruku | Odbijeno na razini baze. |
| B blokira A pa A pokuša poslati poruku B | Odbijeno na razini baze, neovisno o smjeru blokade. |
| A odgovori na dopuštenu poruku B | Odgovor prolazi ako zadovoljava postojeću provjeru `reply_to_id`. |
| A doda reakciju na poruku u kojoj je sudionik, bez blokade | Reakcija prolazi uz vlastiti `user_id`. |
| A pokuša dodati reakciju s tuđim `user_id` ili na poruku u kojoj nije sudionik | Odbijeno. |
| A pokuša reagirati na razgovor A–B dok je među njima aktivna blokada | Odbijeno. |
| Član koji nije sudionik pokuša čitati privatnu poruku | Odbijeno postojećim RLS pravilima. |

Nakon svakog testa provjeriti i negativni učinak: nije nastala neželjena poruka, reakcija ili obavijest. Zabilježiti točan rezultat i pogrešku bez spremanja JWT-a ili drugih tajni. Uspješan GitHub CI prolaz provjerava repozitorij, a ne izvršavanje ovih SQL nacrta niti ponašanje žive baze.

