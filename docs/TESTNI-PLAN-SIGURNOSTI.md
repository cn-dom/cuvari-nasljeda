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
| Neprijavljeni korisnik čita profile/objave/komentare | Nema pristupa kroz politike za `authenticated`. |
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
| Neprijavljeni korisnik čita/učitava objekt privatnog bucketa | Odbijeno. |
| Datoteka je veća od 5 MB ili ima nepodržani MIME tip | Storage treba odbiti upload prema konfiguraciji bucketa. |
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
