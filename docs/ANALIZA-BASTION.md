# Analiza Bastion za PatriaSoul – Čuvari nasljeđa

Repozitorij: https://github.com/Calmingstorm/bastion
Pregledano: 11. listopada 2026.

## Sažetak

Bastion je samostalno hostana platforma za razgovore u zajednici. Tehnologije iz README-a: Go backend, PostgreSQL 16, Redis, WebSocket; React 19 / TypeScript / Vite na webu; Docker Compose za postavljanje. Licenca repozitorija označena je kao GNU AGPL-3.0.

## Što je korisno za PatriaSoul

Najprikladnije ideje za samostalnu implementaciju u postojećem React + Cloudflare + Supabase projektu:

1. **Odgovori na poruke** – odgovor na određenu poruku uz prikaz citiranog dijela.
2. **Uređivanje i brisanje vlastitih poruka** – uz provjeru vlasništva na poslužitelju i pravila baze.
3. **Reakcije na poruke** – emoji reakcije s jedinstvenim zapisom po korisniku i poruci.
4. **Pretraživanje razgovora** – pretraživanje samo razgovora kojima prijavljeni član smije pristupiti.
5. **Prikaz tipkanja i prisutnosti** – samo ako se može izvesti bez nepotrebnog praćenja korisnika.
6. **Prikvačene poruke** – korisno u budućim grupnim razgovorima.
7. **Pozivi i grupe** – moguća buduća faza; WebRTC i signalizacija povećavaju složenost i zahtjeve za infrastrukturom.
8. **Ograničavanje učestalosti zahtjeva i revizijski trag moderacije** – vrijedne sigurnosne ideje, ali zahtijevaju provjeru na strani poslužitelja.

## Što ne treba preuzeti izravno

Bastion je zaseban serverski proizvod koji zahtijeva Go, PostgreSQL i Redis te vlastiti WebSocket backend. To nije dodatak koji se može jednostavno kopirati u statički Cloudflare Pages frontend ili Supabase projekt. Uvođenje cijelog sustava značilo bi novu infrastrukturu, autentifikaciju, pohranu, nadzor i održavanje.

## Licenca i način rada

GitHub označava repozitorij licencom **AGPL-3.0**. AGPL dopušta korištenje i izmjene, ali ako se distribuirana izmijenjena verzija koristi kao mrežna usluga, obveze licence mogu uključivati dostupnost odgovarajućeg izvornog koda korisnicima mrežne usluge.

Zato ovaj projekt ne kopira Bastionove izvorne datoteke. Funkcionalnosti se mogu osmisliti i implementirati samostalno na temelju općih ideja, uz ponovnu provjeru licence i podrijetla ako ikada odlučimo preuzeti konkretan kod.

## Preporučeni redoslijed

1. Uređivanje i brisanje vlastitih privatnih poruka uz sigurna pravila baze.
2. Odgovori na pojedinačne poruke.
3. Pretraživanje razgovora.
4. Emoji reakcije na poruke.
5. Grupne razgovore i prisutnost tek nakon što osnovna sigurnost i testna Supabase shema budu potvrđene.

## Ograničenja ovog pregleda

Ovo je početna procjena README-a, repozitorijskih metapodataka i licenciranja, a ne cjelovita revizija svakog izvornog fajla ili pravno mišljenje. Nije promijenjena aplikacija, nije primijenjen SQL i nije izmijenjen nijedan produkcijski sustav.
