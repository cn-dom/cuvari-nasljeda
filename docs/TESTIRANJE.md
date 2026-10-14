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
- [ ] Podnožje mreže prikazuje službeni logo, brzi izbornik, TikTok kanale i pravne poveznice; provjeriti sve poveznice.
- [ ] Profilna fotografija prikazuje se uz objavu, komentar, u imeniku članova i u polju za novu objavu.
- [ ] Reakcije grupnih poruka rade između članova i ostaju nakon ponovnog učitavanja.
- [ ] Testirati na mobitelu i računalu.

## PatriaSoul kviz — preduvjeti povezivanja administracije
- [ ] Otvoriti ugrađeni kviz na `/kviz/` i provjeriti prijavu/zajedničku sesiju.
- [ ] Hrvatski kviz učitava 10 pitanja iz prenesenih 2.000 pitanja i ne otkriva točan odgovor prije odabira.
- [ ] „Brani svoj grad” prikazuje 128 gradova i pokreće 10 pitanja odabranog grada.
- [ ] Dnevni kviz pokreće 10 pitanja; isti korisnik ne može ga ponovno odigrati istoga dana.
- [ ] Odgovori, rezultat, XP, razina i rang-lista spremaju se te ostaju nakon ponovne prijave.
- [ ] Provjeriti administratorske funkcije: `record_quiz_result`, `get_leaderboard`, `admin_dashboard_stats`, `admin_list_users`, `admin_list_quiz_results` i `admin_delete_quiz_result`.
- [ ] Uskladiti polja profila koja očekuje kviz (`role`, `avatar_url`) s društvenom shemom bez otkrivanja privatnih podataka.
- [ ] Potvrditi da su administratorske funkcije zaštićene na strani baze i odbijaju poziv običnog prijavljenog člana.
- [ ] Tek nakon uspješnih testova uključiti stvarne statistike i moderaciju rezultata u administratorskom modulu.

## Važno
Uspješan GitHub Actions build potvrđuje da se projekt izgradio, ali ne potvrđuje automatski sve tokove prijave, pohrane i RLS pravila. Za svaku stavku potrebno je stvarno testiranje u pregledniku s najmanje dva testna računa.

## Automatizirana provjera u GitHub Actions

Workflow `.github/workflows/ci.yml` sada radi produkcijsku izgradnju glavne aplikacije i kviza, zatim pokreće Vite preview i izvršava `node scripts/smoke-routes.mjs`. Smoke test provjerava HTTP odgovor za početnu stranicu, forum, stranice zajednice, događaje, administraciju, AI centar i kviz, provjerava mobilni viewport te postojanje manifesta, service workera, logotipa i izgrađenih JS/CSS paketa.

**Ograničenje:** smoke test provjerava dostupnost stranica i datoteka, ne prijavljuje se u Supabase i ne stvara stvarne objave, poruke, rezultate kviza ili događaje. Te interakcije ostaju označene kao nepotvrđene dok se ne provedu end-to-end testovi s dva namjenska testna računa. Ne koristiti stvarne korisničke lozinke u repozitoriju ili zapisima workflowa.
