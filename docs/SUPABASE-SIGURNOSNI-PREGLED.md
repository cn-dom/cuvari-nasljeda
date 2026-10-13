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


## Dodatna provjera — kvizni klijent i javni AI endpoint

### Kvizni klijent: dobar znak, uz preostalu provjeru baze

Pregledani su `kviz/src/lib/mainQuiz.js`, `kviz/src/lib/cityQuiz.js` i `kviz/src/lib/attempts.js`. Glavni i gradski kviz čitaju pitanja iz pogleda `quiz_questions_public` i `city_questions_public`, a popisi kolona koje traže ne uključuju `correct_index`. Odgovor se predaje kroz RPC `submit_quiz_answer`, a završetak kroz `finish_quiz_attempt`. To je ispravan smjer dizajna jer klijent ne mora dobiti ključ odgovora.

To još nije potpuni dokaz zaštite: potrebno je potvrditi da pogledi ne izlažu ključ preko drugih putova i da `submit_quiz_answer` / `finish_quiz_attempt` provjeravaju vlasništvo pokušaja, aktivnost pokušaja, valjanost pitanja i bodovanje na strani baze. Klijent također ima pomoćnu funkciju koja broji aktivna pitanja iz `quiz_questions`; ona traži samo broj redaka, ne odgovore.

### AI endpoint `patria-ai`: zaseban rizik koji treba riješiti

Pregled aktivne Supabase Edge Function `patria-ai` pokazao je:
- `verify_jwt: false` — endpoint ne zahtijeva Supabase JWT provjeru na razini funkcije.
- CORS dopušta `*`, a funkcija prihvaća `question`, `prompt` i `context` iz tijela zahtjeva.
- `context` i dodatni `prompt` su pod kontrolom pozivatelja i umeću se u korisnički ulaz koji se šalje Gemini modelu; zapisi baze i dodatne upute nisu jasno označeni kao nepouzdani sadržaj.
- Funkcija koristi poslužiteljski `GEMINI_API_KEY` i nema vidljivu ugrađenu autentikaciju, ograničenje učestalosti ili kvote u kodu koji je pregledan. To može omogućiti zloupotrebu kvote ako endpoint ostane javno dostupan.

**Nisam mijenjao tu funkciju** jer promjena `verify_jwt` bez provjere svih pozivatelja može prekinuti postojeći AI portal. Prije popravka treba utvrditi gdje se funkcija poziva i koji klijenti šalju autentikacijski token. Preporučeni popravak: poslužiteljska provjera prijave i ovlasti (ako AI nije namijenjen anonimnim posjetiteljima), ograničenje učestalosti/kvote, ograničenje duljine ulaza, pouzdana server-side sistemska pravila te jasno odvajanje nepouzdanog konteksta od uputa. Nikada ne slati ovom endpointu ključeve službenog kviza, tajne, privatne poruke ili administratorske podatke.

Ovaj endpoint je odvojen od aktualnog `src/AICenter.jsx`, koji koristi Puter.js; nalaz se odnosi na aktivnu Supabase funkciju i svaki portal koji je poziva.
