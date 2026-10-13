# PatriaSoul – Čuvari nasljeđa

**Društvena mreža hrvatskog zajedništva — besplatna i nekomercijalna.**

PatriaSoul – Čuvari nasljeđa mjesto je za povezivanje ljudi kroz hrvatsku povijest, baštinu, kulturu, vjeru, znanje i zajedništvo.

## Tehnički temelj

- **Frontend:** React + Vite; društveni zid i kviz grade se u istom repozitoriju.
- **Hosting:** Cloudflare Workers / static assets iz `dist`.
- **Prijava i podaci:** Supabase Auth, PostgreSQL i Storage.
- **Vizualni identitet:** PatriaSoul boje, logo i hrvatski motivi, prilagođeni mobilnim uređajima.
- **Emoji:** Emoji Mart.

## Funkcije koje već imaju implementaciju u kodu

Glavna aplikacija sadrži sučelje i logiku za više dijelova zajednice, uključujući:

- registraciju/prijavu i učitavanje sesije;
- profil člana;
- zid, objave, komentare i reakcije;
- fotografije objava preko Supabase Storagea;
- označavanje članova, pretraživanje i Emoji Mart;
- blokiranje i prijavu objava;
- privatne i grupne poruke te obavijesti;
- vremenski pregled i dnevni vjerski sadržaj;
- integrirani kviz pod putanjom `/kviz/`.

**Napomena:** postojanje koda nije dokaz da je svaka funkcija već ispravno povezana s produkcijskom bazom ili provjerena u stvarnom pregledniku. Za svaku se funkciju moraju potvrditi tablice, RLS, Storage i ponašanje nakon osvježavanja stranice.

## Prioritet prije daljnjeg razvoja

Društveni dio i kviz trenutačno se oslanjaju na isti Supabase klijent (`src/lib/supabase.js`), pa moraju koristiti isti Supabase projekt. Pregled dostupnih projekata pokazao je da su podaci kviza i društvene tablice raspoređeni između dvaju postojećih projekata. Prije spajanja ili promjene sheme treba odabrati kanonski projekt i napraviti plan koji čuva postojeće podatke. Detalji su u [tehničkoj provjeri](./docs/STATUS-TEHNICKE-PROVJERE.md).

## Razvoj i sigurnost

- Ne izlagati `service_role` ili tajne ključeve u pregledniku ili `VITE_*` varijablama.
- Provjeriti RLS na svim tablicama koje aplikacija izlaže.
- Provjeriti autorizaciju za administrativne RPC funkcije i grupne razgovore.
- Ne pokretati migracije nad postojećom bazom bez potvrđenog ciljnog projekta i pregleda SQL-a.
- Testirati s anonimnim korisnikom i najmanje dva različita računa.
- Pokrenuti build i funkcionalne provjere prije svakog produkcijskog deploya.

## Dokumentacija

- [Arhitektura i fazni plan](./docs/ARHITEKTURA-I-PLAN.md)
- [Plan povezivanja kviza](./docs/INTEGRACIJA-KVIZA.md)
- [Plan Supabase modela](./docs/PLAN-SUPABASE.md)
- [Tehnička provjera aktualnog stanja](./docs/STATUS-TEHNICKE-PROVJERE.md)
- [Pregled kandidatskog projekta OpenSourceCommunity](./docs/PROVJERA-IZVORA.md)

## Trenutačni status

GitHub Actions produkcijska izgradnja prošla je na commitu `1dc926c` (13. listopada 2026.). To potvrđuje da se frontend i kviz mogu izgraditi, ali ne potvrđuje da je aplikacija ispravno konfigurirana u Cloudflareu niti da sve Supabase funkcije rade. Sljedeći korak je uskladiti jedinstvenu bazu za kviz i društvenu mrežu, zatim testirati zid, profile, Storage, poruke i prava pristupa.
