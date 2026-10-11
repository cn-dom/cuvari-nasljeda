# PatriaSoul – Čuvari nasljeđa

**Društvena mreža hrvatskog zajedništva — besplatna i nekomercijalna.**

PatriaSoul – Čuvari nasljeđa zamišljena je kao mjesto za povezivanje ljudi kroz hrvatsku povijest, baštinu, kulturu, vjeru, znanje i zajedništvo.

## Temelj projekta

Ovaj repozitorij namijenjen je prilagodbi platforme [OpenSourceCommunity](https://github.com/JonJLevesque/OpenSourceCommunity) za PatriaSoul – Čuvari nasljeđa.

Projekt je planiran kao besplatna, nekomercijalna usluga: bez naplate članstva, pretplata, oglasa ili drugih izvora prihoda. Izvorna licenca zabranjuje komercijalnu uporabu bez zasebnog pisanog dopuštenja autora. Izvorna licenca i obavijesti o autorstvu moraju ostati sačuvane.

## Planirane funkcije

- Registracija, prijava, profili članova i postavke privatnosti.
- Zid zajednice: objave s tekstom i fotografijama, komentari i reakcije.
- Emoji i reakcije koje rade na računalu i mobitelu.
- Označavanje drugih članova u objavama i komentarima.
- Grupe, stranice, događaji i kalendar.
- Dijeljenje PatriaSoul kvizova i rezultata na zidu.
- Privatne poruke i obavijesti.
- Pretraživanje članova i sadržaja.
- Prijava neprimjerenog sadržaja, blokiranje članova i administratorsko moderiranje.
- Članovi mogu uređivati i brisati vlastite objave, fotografije i komentare.
- Hrvatsko sučelje i identitet PatriaSoul: crveno-bijelo-plava paleta, hrvatska zastava i suptilni hrvatski motivi.

Navedeno su ciljevi prilagodbe, a ne tvrdnja da su funkcije već implementirane.

## Tehnologija i sigurnost

Planirani cilj je GitHub + Cloudflare + Supabase, nakon provjere kompatibilnosti stvarnog izvornog koda.

- Za testiranje koristiti isključivo zaseban Supabase projekt.
- Ne povezivati aplikaciju s postojećim PatriaSoul bazama ili produkcijom tijekom početnog razvoja.
- Ne pokretati migracije, `db:push` ili seed nad postojećom bazom.
- Ne spremati API ključeve, tokene ni druge tajne u repozitorij.
- Prije javnog pokretanja provjeriti autentikaciju, RLS politike, prava pristupa, upload fotografija, CORS i moderiranje.

## Izvorni projekt i pripisivanje autorstva

- Izvor: [OpenSourceCommunity](https://github.com/JonJLevesque/OpenSourceCommunity)
- Prilagodba: PatriaSoul – Čuvari nasljeđa
- Izvorna licenca: [LICENSE](./LICENSE)
- Tehnička provjera: [docs/PROVJERA-IZVORA.md](./docs/PROVJERA-IZVORA.md)

Izvorni projekt i njegovi autori ne smiju se pogrešno predstavljati kao da su izvorno napisani za PatriaSoul. Sve izmjene treba jasno dokumentirati.

## Status

Trenutačno su postavljeni početna dokumentacija, kopija izvorne licence i tehnička provjera. Aplikacijski kod još nije uvezen, testiran ni deployan. Sljedeći korak je uvoz izvornog koda uz očuvanje licence, zatim izolirano pokretanje i provjera prije prilagodbe sučelja.
