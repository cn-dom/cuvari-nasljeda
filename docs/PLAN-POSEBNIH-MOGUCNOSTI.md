# Plan posebnih mogućnosti PatriaSoul – Čuvari nasljeđa

## Načelo

PatriaSoul treba razvijati vlastiti identitet oko hrvatske baštine i doprinosa članova. Ne kopirati tuđe projekte ili njihov kod; preuzimati samo ideje i samostalno ih prilagoditi React/Vite, Cloudflare Pages i Supabase arhitekturi.

## Faze razvoja

### 1. Čuvari nasljeđa — prijedlozi priča
- Član šalje naslov, opis, mjesto, približan datum/razdoblje, kategoriju i izvore.
- Prilozi mogu sadržavati fotografije uz obvezan opis izvora i potvrdu prava na objavu.
- Statusi: nacrt, poslano, u provjeri, potrebno dopuniti, odobreno, odbijeno.
- Uredničko sučelje za pregled, bilješke, dopunu i odluku.
- Javna objava tek nakon odobrenja; prijavitelj može pratiti status.
- Potrebni su RLS, evidencija uredničkih odluka i ograničenje prijenosa datoteka. SQL ostaje nacrt dok se izričito ne odobri testna baza.

### 2. Karta hrvatske baštine
- Početni prikaz točaka na karti i popisa lokacija.
- Svaka lokacija ima naziv, koordinate, vrstu, opis, izvore, fotografije i urednički status.
- Podržati muzeje, spomenike, sakralnu baštinu, lokalne priče i povijesne lokacije.
- Ne objavljivati osjetljive ili privatne lokacije bez odgovarajuće provjere.

### 3. Bodovi, značke i rang-liste
- Bodovi samo za jasno definirane i provjerljive radnje; bez nagrađivanja spama ili masovnih reakcija.
- Značke: „Istraživač”, „Poznavatelj povijesti”, „Čuvar baštine”.
- Odvojiti bodove za kviz od urednički potvrđenih doprinosa.
- Evidencija bodova mora biti nepromjenjiva za običnog klijenta; izračun i dodjela kroz provjerenu serversku logiku.

### 4. Na današnji dan
- Postojeći izvor: repozitorij `cn-dom/ps`, datoteka `data/na-danasnji-dan.json`, skripta `assets/js/na-danasnji-dan.js` i stranica `stranice/na-danasnji-dan.html`.
- Ponovno upotrijebiti postojeći izvor kao početnu točku, ali pregledati datume, tekstove, duplikate i izvore prije nego se podaci prikažu kao provjerene činjenice.
- U novoj mreži napraviti kompaktnu karticu s datumom, istaknutim događajem, izvorom i poveznicom na cijeli pregled.
- Kasnije povezati pitanje dana i relevantni kviz ako postoji provjereno pitanje za taj datum.
- Ne duplicirati postojeći sustav bez potrebe i ne prikazivati nepotvrđene zapise kao činjenice.

### 5. Digitalna zbirka
- Albumi starih fotografija, razglednica, obiteljskih uspomena i dokumenata.
- Metapodaci: autor/vlasnik ako je poznat, približna godina, mjesto, opis, izvor, prava/licenca i razina privatnosti.
- Privatne obiteljske uspomene ne smiju automatski postati javne.
- Omogućiti prijedlog ispravka metapodataka i uredničku provjeru.

### 6. Video, prijenosi uživo i glasovne poruke
- Kasnija faza nakon provjere troškova, kvota, moderacije i pristupačnosti.
- Glasovne poruke i kratki video zahtijevaju ograničenja veličine/trajanja, obradu prijava i pravila čuvanja.
- Prijenose uživo planirati zasebno; ne pretpostavljati da ih Cloudflare Pages ili Supabase sami pružaju.

## Redoslijed preporuke

1. Prijedlozi priča i urednička provjera.
2. Kartica „Na današnji dan” s provjerenim izvorima.
3. Karta baštine.
4. Digitalna zbirka.
5. Bodovi i značke s pravilima protiv zlouporabe.
6. Video, glasovne poruke i prijenosi uživo.

## Sigurnosna napomena

Sve SQL migracije i politike pristupa ostaju dokumentacija/nacrti dok korisnik izričito ne odobri testnu Supabase bazu. Ne mijenjati produkciju tijekom razvoja.
