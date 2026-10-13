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
- [ ] Komentari se prikazuju gostima, ali samo prijavljeni članovi mogu komentirati.
- [ ] Reakcije se spremaju i nakon osvježavanja ostaju točne.
- [ ] Autor može urediti i izbrisati vlastitu objavu.
- [ ] Prijava sadržaja sprema se i pojavljuje u administraciji.
- [ ] Blokirani članovi ne pojavljuju se na zidu osobe koja ih je blokirala.

## Zajednica
- [ ] Forum: popis kategorija, stvaranje teme i odgovor.
- [ ] Stranice: pregled, stvaranje stranice i objava na stranici.
- [ ] Događaji: pregled, stvaranje budućeg događaja i potvrda/poništenje dolaska.
- [ ] Privatne poruke i grupni razgovori rade između dvaju testnih računa.

## Administracija i sigurnost
- [ ] Samo vlasnički račun može otvoriti administraciju.
- [ ] Vlasnik može pregledati prijave i promijeniti njihov status.
- [ ] Vlasnik može ukloniti objavu i komentar; provjeriti da običan član to ne može učiniti drugima.
- [ ] Nakon uklanjanja sadržaja nema JavaScript pogrešaka ni pokvarenih prikaza.
- [ ] Testirati na mobitelu i računalu.

## Važno
Uspješan GitHub Actions build potvrđuje da se projekt izgradio, ali ne potvrđuje automatski sve tokove prijave, pohrane i RLS pravila. Za svaku stavku potrebno je stvarno testiranje u pregledniku s najmanje dva testna računa.
