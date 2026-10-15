# Puter.js AI centar — opseg prve integracije

## Pravilo protiv dupliranja
Prije dodavanja nove funkcije pregledane su postojeće komponente src/App.jsx, src/Forum.jsx, src/Pages.jsx, src/Events.jsx, src/Admin.jsx i kviz/src/App.jsx. Postojeći zid, forum, stranice, događaji, vremenski pregled, dnevni sadržaj vjere, kviz, profili, poruke, obavijesti i administratorske prijave ostaju primarni sustavi. AI ih ne zamjenjuje i ne stvara kopije njihovih podataka.

## Što je uključeno u prvu fazu
- Jedna zasebna stranica /ai-centar.html kao zajedničko mjesto za AI alate.
- AI vodič na hrvatskom za pitanja o povijesti, gradovima, običajima i baštini.
- Trener znanja koji izrađuje neovisnu vježbu od pet pitanja; ne upisuje bodove i ne mijenja službeni kviz.
- Analiza slike ili skeniranog dokumenta; AI opis nije potvrda autentičnosti, datuma ili identiteta.
- Čitanje zadnjeg AI odgovora naglas ako Puterov govorni model i preglednik podržavaju hrvatski glas.
- Kopiranje zadnjeg AI odgovora u međuspremnik radi lakšeg spremanja ili dijeljenja.
- Pretvaranje kratke učitane audio snimke u tekst pomoću Puter speech-to-text; prijepis se prvo prikaže u polju pitanja i ne šalje se automatski.
- Izrada AI ilustracije u testnom načinu rada, uz jasno označavanje da nije povijesna fotografija.
- Objašnjavanje tehničke poruke koju korisnik ručno zalijepi; ne pristupa automatski GitHubu, Supabaseu ni Cloudflareu.

## Namjerno nije uključeno
- AI pisanje ili prepravljanje objava i komentara na društvenom zidu.
- Novi kalendar, vremenska prognoza, novi forum ili novi sustav administracije.
- Automatsko uređivanje ili brisanje objava, zabrana računa, dodjela uloga ili izmjena rezultata kviza.
- Nova Supabase tablica, migracija ili spremanje učitanih fotografija.
- Automatska provjera web-izvora: odgovori mogu biti netočni i moraju se neovisno provjeravati.

## Detaljan sigurnosni plan

Povezani plan zabrana, tehničkih mjera P0/P1/P2 i testnih slučajeva nalazi se u [AI-SIGURNOSNI-PLAN.md](./AI-SIGURNOSNI-PLAN.md). Taj dokument opisuje ciljanu zaštitu; ne znači da su sve provjere baze i produkcijskih postavki već provedene.

## Sigurnosne granice
- Ne šalju se podaci Supabasea, privatne poruke, skriveni postovi ili administratorske prijave u AI.
- Ne traže se ni pohranjuju lozinke, API ključevi ili tokeni.
- Učitane slike obrađuju se samo nakon izričite akcije korisnika; limit datoteke u sučelju je 5 MB.
- Puter.js može tražiti zasebnu Puter prijavu; kvote, modeli i trošak ovise o Puterovim aktualnim pravilima.
- Nema izmjena baze ni produkcijskih podataka u ovoj fazi.

## Provjera prije širenja
1. npm run build mora proći za glavnu aplikaciju i ugrađeni kviz.
2. Otvoriti /ai-centar.html i testirati Puter prijavu, odgovor na pitanje, novu sesiju, čitanje naglas, analizu slike i greške usluge.
3. Provjeriti mobilni izgled i da portal/kviz rade kad AI nije dostupan.
4. Tek nakon provjere odlučiti treba li povezati AI s postojećim kvizom, arhivom baštine ili administratorskim pregledom.


## Dodatak: Puter AI u Virtualnom muzeju PatriaSoul

Komponenta `src/VirtualMuseumPuter.jsx` dostupna je unutar sučelja Virtualnog muzeja PatriaSoul. Može pripremiti:
- 5–8 ideja za muzejske zapise i popis podataka za provjeru;
- nacrt virtualne tematske izložbe;
- urednički pregled zalijepljenog nacrta muzejskog zapisa.

### Granice ove faze
- AI stvara samo tekstualne nacrte; ne dodaje automatski predmete, slike ili zapise u Supabase.
- Nema automatske objave. Čovjek mora potvrditi činjenice, izvore, provenijenciju i prava na fotografije.
- Sučelje upozorava da se sadržaj šalje vanjskoj Puter AI usluzi i zaustavlja slanje kada prepozna česte obrasce tajnih ključeva ili tokena.
- Puterova prijava, kvote i dostupnost modela ovise o samoj usluzi.
- Produkcijski build i Cloudflare deploy moraju se provjeriti zasebno nakon ovih izmjena.
