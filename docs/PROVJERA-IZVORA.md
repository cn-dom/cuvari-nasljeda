# Tehnička provjera izvornog projekta

Datum provjere: 11. listopada 2026.

## Izvor

- Repozitorij: https://github.com/JonJLevesque/OpenSourceCommunity
- Izvorna licenca: OpenSourceCommunity Non-Commercial License, Version 1.0 (2025).
- Izvorni projekt ima monorepo strukturu s 429 stavki u Git stablu u trenutku provjere.

## Uočena tehnologija

- Monorepo: pnpm workspaces i Turborepo.
- Web: Next.js App Router, TypeScript i Tailwind.
- API: Hono na Cloudflare Workers.
- Podaci: PostgreSQL / Supabase uz Drizzle ORM.
- Prijava, pohrana i realtime mogućnosti oslanjaju se na Supabase.
- Izvorna konfiguracija navodi Node.js 22+ i pnpm 9+.

## Licenca — obavezno ograničenje

Licenca dopušta osobnu i organizacijsku uporabu, kopiranje i izmjene uz očuvanje obavijesti o autorskim pravima i navođenje izmjena. Izričito zabranjuje komercijalnu uporabu, naplatni hosting/SaaS i uporabu u uslugama koje ostvaruju prihod bez zasebnog pisanog dopuštenja nositelja prava.

Prije javnog pokretanja treba odlučiti može li PatriaSoul ostati nekomercijalan. Ako se planira prihod, oglasi ili naplatne funkcije, potrebno je prije nastavka dobiti pravno pojašnjenje i/ili pisano dopuštenje autora. Ovaj zapis nije pravni savjet.

## Sigurnosne napomene

- Ne kopirati stvarne tajne iz konfiguracijskih datoteka.
- Ne spajati probnu aplikaciju na postojeće PatriaSoul Supabase projekte.
- Ne pokretati `db:push`, migracije ili seed nad postojećom bazom.
- Prije deploya provjeriti sve varijable, CORS, autentikaciju, RLS politike i upload pravila.
- Provjeriti izvorne funkcije i njihove stvarne implementacije prije obećavanja da su spremne za produkciju.

## Funkcije za provjeru i prilagodbu

1. Hrvatsko sučelje i PatriaSoul vizualni identitet.
2. Profili i privatnost.
3. Zid objava: tekst, fotografije, komentari, reakcije i označavanje.
4. Grupe, stranice, događaji i kalendar.
5. Dijeljenje kvizova i rezultata.
6. Privatne poruke i obavijesti.
7. Prijava sadržaja, blokiranje i administratorsko moderiranje.
8. Brisanje vlastitih objava, fotografija i komentara.
9. Pristupačnost, mobilni prikaz i automatizirani QA.

## Trenutačni status

Ovo je samo početna provjera izvora. Aplikacijski kod još nije uvezen u ovaj repozitorij, nije pokrenut lokalno i nije deployan. Sljedeći tehnički korak je uvoz cijelog izvornog repozitorija uz očuvanje povijesti/licence ili dokumentirano kopiranje, zatim pokretanje izoliranog testnog okruženja.
