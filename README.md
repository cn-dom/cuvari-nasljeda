# PatriaSoul – Čuvari nasljeđa

Domoljubna društvena mreža za hrvatsko zajedništvo, povijest, baštinu i znanje.

## Temelj projekta

Ovaj repozitorij namijenjen je prilagodbi platforme [OpenSourceCommunity](https://github.com/JonJLevesque/OpenSourceCommunity) za PatriaSoul – Čuvari nasljeđa.

**Važno:** izvorni projekt ima licencu koja ograničava komercijalnu uporabu. Prije javnog pokretanja ili monetizacije potrebno je provjeriti aktualne uvjete licence i po potrebi dobiti dopuštenje autora.

## Plan prilagodbe

- Hrvatsko sučelje i identitet PatriaSoul: crveno-bijelo-plava paleta, hrvatska zastava i suptilan hrvatski pleter/šahovnica.
- Profili članova i postavke privatnosti.
- Zid zajednice: tekstualne objave, fotografije, komentari, reakcije i označavanje članova.
- Grupe, stranice, događaji i kalendar.
- Dijeljenje hrvatskih kvizova i rezultata na zidu i u komentarima.
- Privatne poruke i obavijesti.
- Prijava sadržaja, blokiranje korisnika i alati za moderiranje.
- Članovi mogu uređivati i brisati vlastite objave, fotografije i komentare.
- Administratorske ovlasti i provjere kvalitete.

## Tehnologija i sigurnost

Planirani cilj je GitHub + Cloudflare + Supabase, nakon provjere kompatibilnosti stvarnog izvornog koda. Postojeće PatriaSoul baze i produkcija ne smiju se koristiti za početno testiranje.

1. Najprije pregledati izvorni kod, licencu, konfiguraciju i upute za Cloudflare.
2. Pokrenuti probnu instalaciju s **odvojenim testnim Supabase projektom**.
3. Provjeriti prijavu, dozvole, migracije baze, pohranu fotografija i moderiranje.
4. Tek nakon uspješnih provjera prilagoditi izgled i funkcije.
5. Ne dodavati ključeve, tokene ili tajne u repozitorij.

## Izvorni projekt

- Projekt: [OpenSourceCommunity](https://github.com/JonJLevesque/OpenSourceCommunity)
- Ovaj repozitorij: [cn-dom/cuvari-nasljeda](https://github.com/cn-dom/cuvari-nasljeda)

## Status

Početna dokumentacija je postavljena. Aplikacijski kod još nije uvezen niti je aplikacija deployana. Sljedeći korak je uvoz i tehnička provjera izvornog projekta prije spajanja na bilo koju bazu ili produkcijsku uslugu.
