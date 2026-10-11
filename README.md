# PatriaSoul – Čuvari nasljeđa

**Društvena mreža hrvatskog zajedništva — besplatna i nekomercijalna.**

PatriaSoul – Čuvari nasljeđa zamišljena je kao mjesto za povezivanje ljudi kroz hrvatsku povijest, baštinu, kulturu, vjeru, znanje i zajedništvo.

## Smjer projekta

Gradimo vlastitu društvenu mrežu, ne preuzimamo jednu tuđu platformu kao cjelinu. Vizualni identitet i dizajnerske uzorke prilagođavamo iz vlastitog [PatriaSoul repozitorija](https://github.com/cn-dom/ps), a pojedine funkcije ili komponente biramo iz drugih projekata tek nakon provjere koda, licence, sigurnosti i kompatibilnosti.

- **Frontend i vizualni identitet:** PatriaSoul dizajn, prilagođen za društvenu mrežu i mobilne uređaje.
- **Hosting i aplikacijska logika:** Cloudflare Pages / Workers, ovisno o funkciji.
- **Prijava i podaci:** Supabase Auth, PostgreSQL, Storage i Realtime gdje je potrebno.
- **Razvoj:** postupno, na zasebnim granama i u odvojenom testnom okruženju.

Projekt je zamišljen kao besplatna i nekomercijalna usluga bez oglasa, pretplata, naplate članstva ili drugih izvora prihoda.

## Planirane funkcije

- Registracija, prijava, profili članova i postavke privatnosti.
- Zid zajednice: objave s tekstom i fotografijama, komentari i reakcije.
- Emoji picker i označavanje članova u objavama i komentarima.
- Grupe, stranice, događaji i kalendar.
- Dijeljenje PatriaSoul kvizova i rezultata na zidu.
- Privatne poruke i obavijesti.
- Pretraživanje članova i sadržaja.
- Prijava neprimjerenog sadržaja, blokiranje članova i administratorsko moderiranje.
- Članovi mogu uređivati i brisati vlastite objave, fotografije i komentare.

Navedeno su ciljevi prilagodbe, a ne tvrdnja da su funkcije već implementirane.

## Licenciranje i autorstvo

Svaki vanjski projekt ili komponenta mora imati zasebno provjerenu licencu. Za preuzete dijelove bilježit ćemo izvor, verziju, licencu, obvezne napomene i vlastite izmjene. Nećemo kopirati komponente ako njihovi uvjeti nisu jasni ili nisu kompatibilni s projektom.

[OpenSourceCommunity Non-Commercial License](./licenses/OPEN-SOURCE-COMMUNITY-NON-COMMERCIAL-LICENSE.txt) spremljena je kao evidencija licence jednog ranije razmatranog kandidata; **nije odabrana kao licenca cijelog PatriaSoul projekta**. Kandidatski aplikacijski kod nije uvezen. Vlastitu licencu projekta odredit ćemo nakon što se razdvoje vlastiti dijelovi i licence stvarno odabranih ovisnosti.

## Sigurnost

- Za testiranje koristiti isključivo zaseban Supabase projekt.
- Ne povezivati razvojnu aplikaciju s postojećim PatriaSoul bazama tijekom početnog razvoja.
- Ne pokretati migracije, `db:push` ili seed nad postojećim bazama.
- Ne spremati API ključeve, tokene ni druge tajne u repozitorij.
- Provjeriti RLS, autentikaciju, uloge, CORS, pohranu fotografija i moderiranje.
- U pregledniku koristiti samo javni/publishable Supabase ključ; tajne ostaju u sigurnim Cloudflare secrets.

## Dokumentacija

- [Arhitektura i fazni plan](./docs/ARHITEKTURA-I-PLAN.md)
- [Pregled kandidatskog projekta OpenSourceCommunity](./docs/PROVJERA-IZVORA.md)
- [Evidencija licence kandidata](./licenses/OPEN-SOURCE-COMMUNITY-NON-COMMERCIAL-LICENSE.txt)

## Status

Trenutačno su pripremljeni dokumentacija i razvojna grana. Aplikacijski kod društvene mreže još nije implementiran, testiran ni objavljen.
