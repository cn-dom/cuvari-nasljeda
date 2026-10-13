# Čuvari nasljeđa — kontrolni popis testiranja

Ovaj popis služi za završnu provjeru testne verzije. Označi stavku tek nakon što je ručno provjerena u pregledniku.

## Pristup i računi
- [ ] Zid se može pregledavati bez prijave.
- [ ] Gost ne može objaviti, lajkati, komentirati ni potvrditi dolazak na događaj.
- [ ] Registracija radi i prikazuje jasnu poruku o potvrdi e-pošte.
- [ ] Prijava, odjava i obnova lozinke rade.
- [ ] Profil se može spremiti, ponovno učitati i prikazuje spremljene podatke.

## Zid zajednice
- [ ] Objavljivanje teksta radi.
- [ ] Učitavanje slike radi; provjeriti granicu od 10 MB i odbijanje prevelike datoteke.
- [ ] Profilna fotografija prihvaća do 10 MB, odbija veće datoteke i ostaje vidljiva nakon ponovne prijave.
- [ ] Komentari se prikazuju gostima, ali samo prijavljeni članovi mogu komentirati.
- [ ] Reakcije se spremaju i nakon osvježavanja ostaju točne.
- [ ] Autor može urediti i izbrisati vlastitu objavu.
- [ ] Prijava sadržaja sprema se i pojavljuje u administraciji.
- [ ] Isti član ne može stvoriti drugu prijavu iste objave dok je prva na čekanju.
- [ ] Nakon što je prijava pregledana ili odbačena, provjeriti može li se prijava ponovno poslati.
- [ ] Blokirani članovi ne pojavljuju se na zidu osobe koja ih je blokirala.

## Zajednica
- [ ] Forum: popis kategorija, stvaranje teme i odgovor.
- [ ] Stranice: pregled, stvaranje stranice i objava na stranici.
- [ ] Događaji: pregled, stvaranje budućeg događaja i potvrda/poništenje dolaska.
- [ ] Privatne poruke i grupni razgovori rade između dvaju testnih računa.
- [ ] Vlasnik u administraciji vidi grupne razgovore, broj članova i broj poruka bez prikaza sadržaja privatnih poruka.
- [ ] Gumb Članovi otvara popis članova odabrane grupe s ulogom i datumom pridruživanja.
- [ ] Vlasnik može ukloniti običnog člana iz grupe uz potvrdu.
- [ ] Osnivač i administratori grupe prikazuju se kao zaštićeni i ne mogu se ukloniti tom radnjom.
- [ ] Nakon uklanjanja člana, popis i broj članova odmah se ažuriraju.
- [ ] Nevlasnički račun ne može pozvati funkciju za uklanjanje člana.
- [ ] Nevlasnički račun ne može pozvati funkciju za pregled članova grupe.
- [ ] Račun koji nije vlasnik ne može pozvati administratorsku funkciju za pregled grupa.

## Administracija i sigurnost
- [ ] Samo vlasnički račun može otvoriti administraciju.
- [ ] Pregled sustava prikazuje broj članova, objava, komentara, otvorenih prijava, budućih događaja, tema foruma i stranica.
- [ ] Osvježavanje administracije ponovno učitava podatke iz baze.
- [ ] Prijave se mogu filtrirati po statusu i pretraživati.
- [ ] Vlasnik može pregledati prijave i promijeniti njihov status.
- [ ] Vlasnik može ukloniti objavu i komentar; provjeriti da običan član to ne može učiniti drugima.
- [ ] Nakon uklanjanja sadržaja nema JavaScript pogrešaka ni pokvarenih prikaza.
- [ ] Testirati na mobitelu i računalu.

## PatriaSoul kviz — preduvjeti povezivanja administracije
- [ ] Otvoriti ugrađeni kviz na `/kviz/` i provjeriti prijavu/zajedničku sesiju.
- [ ] U testnoj bazi potvrditi da postoje tablice `quiz_questions` i `quiz_results` te javni prikaz pitanja `quiz_questions_public`.
- [ ] Provjeriti da su postavljene potrebne funkcije: `record_quiz_result`, `get_leaderboard`, `admin_dashboard_stats`, `admin_list_users`, `admin_list_quiz_results` i `admin_delete_quiz_result`.
- [ ] Uskladiti polja profila koja očekuje kviz (`role`, `avatar_url`) s društvenom shemom bez otkrivanja privatnih podataka.
- [ ] Potvrditi da su administratorske funkcije zaštićene na strani baze i odbijaju poziv običnog prijavljenog člana.
- [ ] Tek nakon uspješnih testova uključiti stvarne statistike i moderaciju rezultata u administratorskom modulu.

## Važno
Uspješan GitHub Actions build potvrđuje da se projekt izgradio, ali ne potvrđuje automatski sve tokove prijave, pohrane i RLS pravila. Za svaku stavku potrebno je stvarno testiranje u pregledniku s najmanje dva testna računa.
