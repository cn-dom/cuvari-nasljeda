# Arhitektura i plan razvoja — PatriaSoul Čuvari nasljeđa

## Odluka o smjeru

Nećemo preuzeti jednu gotovu društvenu mrežu kao cjelinu. Gradimo vlastitu aplikaciju u ovom repozitoriju, a iz drugih projekata izdvajamo samo konkretne, korisne komponente ili obrasce nakon pregleda licence, koda, sigurnosti i kompatibilnosti.

- **Vizualni uzor:** vlastiti PatriaSoul repozitorij [cn-dom/ps](https://github.com/cn-dom/ps).
- **Hosting i izvršavanje:** Cloudflare Pages i Cloudflare Workers, ovisno o dijelu aplikacije.
- **Identitet i podaci:** Supabase Auth, PostgreSQL, Storage i Realtime gdje stvarno trebaju.
- **Razvoj:** male promjene na zasebnim granama, provjere nakon svake faze i bez izravnog rada na produkciji.
- **Namjena:** besplatno, nekomercijalno druženje i očuvanje hrvatskog nasljeđa.

## Vizualni smjer iz PatriaSoul repozitorija

Za dizajn ćemo proučiti i prilagoditi vlastite uzorke iz:
- `kviz/src/index.css` — boje, tipografija, tamna podloga i diskretni hrvatski motivi.
- `stranice/domoljubni-forum.html` — raspored kartica, jasna zaglavlja, gumbi i čitljivi blokovi sadržaja.
- zajedničke CSS datoteke za zaglavlje, navigaciju i responzivni prikaz u `assets/css/`.

Nećemo nekritički kopirati cijele stranice, postojeću autentikaciju ili poslovnu logiku. Izradit ćemo namjensko sučelje društvene mreže: navigaciju, zid objava, kartice članova, profile, grupe i poruke. Mora biti prilagođeno mobitelima i računalu te ostati prepoznatljivo PatriaSoul.

## Plan po fazama

### Faza 0 — pregled i pravila
1. Pregledati strukturu i postojeće UI uzorke u `cn-dom/ps`.
2. Napraviti popis kandidata za pojedine funkcije iz drugih projekata.
3. Za svaki kandidat zabilježiti licencu, datoteku/komponentu, obvezne napomene o autorstvu, ovisnosti i sigurnosne rizike.
4. Ne uvoziti kod ako licenca nije jasna ili nije kompatibilna s namjenom projekta.
5. Odrediti licencu vlastitog koda tek nakon što se razdvoje vlastiti dijelovi i obveze preuzetih komponenti.

### Faza 1 — osnovni izgled i struktura
- React/Vite kao početni kandidat jer se takav frontend već koristi u PatriaSoul kvizu; potvrditi nakon pregleda konfiguracije.
- Osnovni raspored, navigacija, boje, tipografija, gumbi, kartice i mobilni izbornik.
- Statični prototip bez stvarnih korisničkih podataka i bez povezivanja s produkcijskom bazom.

### Faza 2 — sigurna prijava i profili
- Supabase Auth, profil, avatar i postavke privatnosti.
- Row Level Security (RLS) za sve tablice izložene klijentu.
- Zaseban testni Supabase projekt; bez migracija, seedanja ili izmjena postojećih PatriaSoul baza.

### Faza 3 — zid zajednice
- Objave s tekstom i fotografijama, komentari, reakcije, Emoji Mart/emoji picker i označavanje članova.
- Vlasnik može uređivati i brisati vlastiti sadržaj.
- Provjera pravila Storagea, veličine i tipa datoteka, pristupa i brisanja slika.

### Faza 4 — povezivanje članova
- Grupe i stranice, događaji/kalendar, pretraživanje, privatne poruke i obavijesti.
- Dijeljenje PatriaSoul kvizova i rezultata na zidu i u komentarima.

### Faza 5 — sigurnost i moderiranje
- Prijava sadržaja, blokiranje članova, administratorske uloge i zapis ključnih moderatorskih radnji.
- Provjera autorizacije na poslužitelju/bazi, ograničavanje zlouporabe, validacija unosa i privatnosti.

### Faza 6 — objava
- Automatizirane provjere, testovi za prava pristupa, provjera poveznica i mobilnog prikaza.
- Cloudflare preview/development okruženje prije javne objave.
- Produkcijski deploy tek nakon pregleda rezultata i izričitog odobrenja.

## Pravila odabira koda i licenci

- Prednost imaju male, održavane komponente s jasnom licencom i kompatibilnim uvjetima.
- MIT, BSD i Apache-2.0 nisu automatsko jamstvo: i dalje se provjeravaju autorske napomene, ovisnosti, fontovi, ikone i sadržaj.
- Za GPL/AGPL, nekomercijalne i druge ograničavajuće licence procijeniti obveze prije integracije; ne kopirati nasumično dijelove iz različitih licenci.
- Za svaki preuzeti dio čuvati izvorni URL, verziju/commit, licencu, izmjene i pripadajuće obavijesti.
- Ne spremati ključeve, tokene ni vjerodajnice u Git.
- U pregledniku koristiti samo javni/publishable Supabase ključ; tajni ključevi ostaju u sigurnim Cloudflare varijablama/secrets i nikad se ne izlažu klijentu.
- RLS mora provoditi prava pristupa čak i kada korisnik zaobiđe sučelje.

## Trenutačni status

Ovo je plan rada, ne implementacija. U ovom commitu nisu preneseni aplikacijski kodovi, nisu napravljene promjene u Supabaseu i nije pokrenut deploy. Prvi praktični korak nakon ovog plana je izrada samostalnog UI temelja u razvojnoj grani, koristeći provjerene vizualne uzorke iz `cn-dom/ps`.
