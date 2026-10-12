# Pregled kandidatskog projekta: OpenSourceCommunity

Datum provjere: 11. listopada 2026.

## Status kandidata

- Repozitorij: https://github.com/JonJLevesque/OpenSourceCommunity
- Status: **kandidat za pojedine funkcije, nije odabran kao temelj cijele aplikacije**.
- U izvornom Git stablu zabilježeno je 429 stavki u trenutku pregleda.
- Aplikacijski kod iz tog repozitorija nije uvezen u PatriaSoul.

## Uočena tehnologija

- Monorepo: pnpm workspaces i Turborepo.
- Web: Next.js App Router, TypeScript i Tailwind.
- API: Hono na Cloudflare Workers.
- Podaci: PostgreSQL / Supabase uz Drizzle ORM.
- Prijava, pohrana i realtime mogućnosti oslanjaju se na Supabase.
- Izvorna konfiguracija navodi Node.js 22+ i pnpm 9+.

Ove tehnologije ne znače da je svaka funkcija dovršena ili da se može izravno prenijeti. Svaki potencijalni modul mora se pregledati i testirati zasebno.

## Licenca kandidata

Izvorni projekt sadrži **OpenSourceCommunity Non-Commercial License, Version 1.0 (2025)**. Ona dopušta kopiranje i izmjene pod uvjetima licence, ali ograničava komercijalnu uporabu, naplatni hosting/SaaS i usluge koje ostvaruju prihod bez pisanog dopuštenja nositelja prava.

Tekst licence sačuvan je u `licenses/OPEN-SOURCE-COMMUNITY-NON-COMMERCIAL-LICENSE.txt` samo kao evidencija razmatranog kandidata. Nije odabrana kao licenca cijelog PatriaSoul projekta. Ako se kasnije odlučimo preuzeti kod iz tog izvora, prije integracije treba provjeriti konkretne obveze i zadržati propisane obavijesti. Ovaj zapis nije pravni savjet.

## Odabrani smjer razvoja

PatriaSoul će biti vlastita aplikacija u repozitoriju `cn-dom/cuvari-nasljeda`:

- vizualni uzor i dizajnerske elemente prilagoditi iz vlastitog repozitorija https://github.com/cn-dom/ps;
- hosting i poslužiteljsku logiku prilagoditi Cloudflare Pages/Workers;
- autentikaciju i podatke povezati sa Supabaseom;
- funkcije drugih projekata uzimati pojedinačno, samo nakon provjere licence, ovisnosti, sigurnosti i kompatibilnosti;
- zabilježiti izvor, verziju/commit, licencu i izmjene svake preuzete komponente.

## Sigurnosne napomene

- Ne kopirati stvarne tajne iz konfiguracijskih datoteka.
- Ne spajati probnu aplikaciju na postojeće PatriaSoul Supabase projekte.
- Ne pokretati `db:push`, migracije ili seed nad postojećom bazom.
- Prije deploya provjeriti sve varijable, CORS, autentikaciju, RLS politike i upload pravila.
- Provjeriti izvorne funkcije i njihove stvarne implementacije prije obećavanja da su spremne za produkciju.

## Trenutačni status

Ovo je pregled jednog kandidatskog projekta, ne uvoz aplikacije. PatriaSoul aplikacijski kod još nije implementiran, pokrenut lokalno ni deployan. Sljedeći praktični korak je izrada vlastitog sučelja i strukture u razvojnoj grani, koristeći provjerene vizualne uzorke iz `cn-dom/ps`.
