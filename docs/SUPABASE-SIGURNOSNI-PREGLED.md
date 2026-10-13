# Supabase sigurnosni pregled — Čuvari nasljeđa

Datum pregleda: 2026-10-13

## Opseg

Pregledani su popisi tablica, njihove kolone, status RLS-a, migracije i Supabase Security Advisor nalazi za:
- aplikacijski projekt Čuvari nasljeđa: `azerctpwfzdivydsxyex`
- povezani/izvorni kvizni projekt: `ijimozjfdffejbczwyzb`

Ovo je inventura i trijaža nalaza, a ne potpuna penetracijska provjera. Sam podatak da je RLS uključen ne dokazuje da su politike ispravne.

## Prioritet P0 — provjeriti prije javnog puštanja

### 1. Odgovori službenog kviza nalaze se u istim tablicama kao pitanja

U aplikacijskom projektu postoje `public.quiz_questions` i `public.city_questions`, a obje tablice imaju `answer_a`–`answer_d` i `correct_index`. U povezanoj bazi postoje i `quiz_attempt_questions.correct_index`. Migracije uključuju migraciju nazvanu `allow_public_read_active_main_quiz_questions`.

**Rizik:** ako javni ili prijavljeni klijent može čitati cijele retke, može zatražiti indeks točnog odgovora izravno preko API-ja, neovisno o tome što AI govori.

**Potrebna provjera i popravak:**
- Provjeriti stvarne SELECT politike i dodijeljene GRANT-ove za `quiz_questions`, `city_questions`, `quiz_attempt_questions` i `quiz_attempt_answers`.
- Ne vraćati `correct_index` ni skrivene odgovore u javnom upitu.
- Poslužiteljska funkcija/RPC treba odabrati pitanja bez ključa odgovora i zasebno provjeriti predani odgovor.
- Bodovanje, XP i rang-lista moraju ostati u provjerenoj bazi/poslužiteljskom postupku.
- Prije promjene politike provjeriti točne pozive kviznog klijenta kako se ne bi pokvarilo igranje.

### 2. SECURITY DEFINER RPC funkcije

Security Advisor za aplikacijski projekt prijavljuje 22 funkcije `SECURITY DEFINER` dostupne ulozi `authenticated`, među njima administratorske funkcije kao `admin_list_users()`, `admin_list_quiz_results()`, `admin_dashboard_stats()` i `admin_delete_quiz_result(...)`, kao i funkcije za pokušaje kviza i upravljanje grupnim razgovorima.

**Rizik:** oznaka `SECURITY DEFINER` sama po sebi nije propust, ali svaka takva funkcija mora provjeriti ovlasti unutar same funkcije. Samo skrivanje administratorskog sučelja u Reactu nije zaštita.

**Potrebna provjera i popravak:**
- Pregledati tijelo svake administratorske RPC funkcije i potvrditi da provjerava pouzdanu administratorsku ulogu na strani baze.
- Provjeriti da se uloga ne može sama dodijeliti promjenom retka profila.
- Za svaku funkciju dodijeliti samo nužne EXECUTE dozvole.
- Ne opozivati sve dozvole odjednom: kviz, rang-lista, poruke i administratorski panel mogu ovisiti o različitim RPC funkcijama.

### 3. Zaštita lozinki

Security Advisor prijavljuje da je zaštita od kompromitiranih/procurjelih lozinki isključena u Supabase Auth postavkama.

**Radnja:** vlasnik projekta treba uključiti Leaked Password Protection u Auth postavkama i provjeriti utjecaj na postojeći tijek registracije/prijave.

## Prioritet P1 — privatnost i pristup

- Potvrditi da privatne poruke mogu čitati samo pošiljatelj i primatelj, uključujući RPC funkcije koje vraćaju sudionike razgovora.
- Potvrditi da privatne prijave, administratorski zapisnik, postavke portala i uredničke skice nisu dostupne članovima bez ovlasti.
- Potvrditi da korisnik može mijenjati samo dopuštena polja vlastitog profila i ne može sam sebi postaviti administratorsku ulogu.
- Pregledati RLS politike za rezultate i napredak igrača, prijave sadržaja, poruke, grupne razgovore i moderaciju.
- AI centar ne smije dohvaćati niti slati modelu skrivene odgovore kviza, privatne poruke, administratorske podatke ili tajne.

## Važna razlika između projekata

Security Advisor izvještaji se razlikuju između dvaju projekata. U izvornom/kviznom projektu prijavljene su i funkcije `get_private_conversation_peers()` i `notify_private_message()` koje Advisor smatra izvršivima ulozi `anon`. U aplikacijskom projektu jedna od tih funkcija nije postojala pod istim potpisom, pa migracija za njezino ograničavanje nije primijenjena.

**Nijedna dozvola nije masovno opozvana u ovom pregledu.** To je namjerno: promjena bez pregleda funkcija i poziva klijenta mogla bi pokvariti kviz, poruke ili administraciju.

## Sljedeći siguran redoslijed

1. Izvući definicije i stvarne ACL/RLS politike funkcija i tablica.
2. Usporediti ih s pozivima u klijentu.
3. Napraviti najmanje potrebne migracije s provjerama administratorskih ovlasti.
4. Premjestiti izlaganje službenih pitanja na RPC koji nikada ne vraća ključ odgovora.
5. Pokrenuti testove za anonimnog korisnika, običnog člana, administratora i vlastiti račun.
6. Ponovno pokrenuti Supabase Security Advisor i kvizne testove.

Ovaj dokument bilježi nalaze i predložene popravke; ne tvrdi da su stavke označene kao potrebne već popravljene.
