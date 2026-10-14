# Sigurnosni pregled — Čuvari nasljeđa
Datum: 2026-10-14

## Sažetak

Ovo je pregled izvornog SQL-a i Supabase Security Advisora, a ne potpuna penetracijska provjera. Ovaj dokument sam po sebi ne mijenja bazu.

## Nalazi

### P1 — Zid i fotografije trenutno su predviđeni kao javno čitljivi

Datoteke `docs/sql/community-core.sql` i `docs/sql/public-wall-access.sql` dopuštaju anonimno čitanje objava i komentara; javno su čitljiva i odabrana polja profila. `docs/sql/community-image-storage.sql` dopušta anonimno čitanje objekata u bucketu `community-images`.

To je u suprotnosti sa zahtjevom proizvoda da objave na društvenom zidu budu vidljive samo prijavljenim članovima. Sama izmjena Storage RLS pravila nije dovoljna ako je bucket postavljen kao public: javni URL-ovi javnog bucketa mogu zaobići pravila čitanja objekata.

**Prije promjene:** provjeriti stvarnu konfiguraciju bucketa i način na koji frontend dohvaća slike (public URL ili signed URL). Zatim u jednoj kontroliranoj migraciji ograničiti SELECT na `authenticated`, provjeriti da bucket nije public i prilagoditi frontend potpisanim URL-ovima ako su potrebni. Nakon toga testirati anoniman preglednik i prijavljenog člana. Nemojte primijeniti samo dio ovih promjena jer bi se mogle pokvariti slike ili ostati javno dostupne.

### P1 — 22 upozorenja za SECURITY DEFINER

Supabase Security Advisor prijavljuje 22 funkcije `SECURITY DEFINER` koje može pozvati uloga `authenticated`. To nije automatski ranjivost: neke funkcije namjerno služe članovima, a neke moraju imati provjeru vlasnika ili članstva unutar same funkcije. Svaku funkciju treba provjeriti prema tijelu, argumentima, povratnim podacima i ACL-u.

Posebno pregledati administrativne funkcije, funkcije za kviz i `create_community_notification`. Ne uklanjati EXECUTE dozvole skupno jer bi se time mogle pokvariti funkcionalnosti.

### P2 — Zaštita od kompromitiranih lozinki isključena

Supabase Auth Security Advisor upozorava da je zaštita od poznatih kompromitiranih lozinki isključena. Uključiti je kroz Auth postavke nakon provjere utjecaja na prijavu i registraciju.

## Pozitivne provjere iz pregledanih nacrta

- Privatne poruke imaju RLS pravila koja ograničavaju čitanje na pošiljatelja i primatelja.
- Reakcije na privatne poruke provjeravaju sudjelovanje korisnika u razgovoru.
- Grupne poruke i reakcije ograničene su na članove grupe; administrativni prijenos uloge ima zasebnu funkciju.
- Funkcije vlasničke administracije koje su pregledane provjeravaju vlasničku e-adresu unutar SQL-a, ne samo u frontend-u.
- Pravila za prijenos fotografija ograničavaju pisanje na korisničku mapu.

## Sljedeći koraci

1. Provjeriti konfiguraciju bucketa `community-images` i kod za prikaz fotografija.
2. Pregledati definicije i dozvole za svaku od 22 funkcije `SECURITY DEFINER`, počevši od administracije i `create_community_notification`.
3. Napraviti najmanju moguću migraciju za zid vidljiv samo prijavljenim članovima, tek nakon potvrde kako su slike poslužene.
4. Testirati barem četiri uloge/scenarija: anoniman posjetitelj, običan član, autor sadržaja i vlasnik mreže.
5. Nakon promjena ponovno pokrenuti Supabase Security Advisor.

## Ograničenje

Nije potvrđeno da svi SQL nacrti u repozitoriju odgovaraju trenutnom stanju baze. Ne tretirati nacrte označene REVIEW-ONLY kao primijenjene migracije.
