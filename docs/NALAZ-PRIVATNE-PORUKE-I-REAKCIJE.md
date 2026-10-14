# Nalaz: privatne poruke i reakcije — provjera baze

Datum provjere: 2026-10-14  
Supabase projekt: `azerctpwfzdivydsxyex`  
Opseg: samo čitanje kataloga PostgreSQL-a; nisu izvršene promjene baze ni korisničkih podataka.

## Potvrđeno na bazi

- RLS je uključen na `private_messages`, `private_message_reactions` i `blocked_users`.
- Privatne poruke mogu čitati samo sudionici prema pravilima `private_messages_select_participant`.
- Umetanje poruke ograničeno je na prijavljenog pošiljatelja (`sender_id = auth.uid()`), drugog primatelja i tekst duljine 1–2000 znakova.
- Reakcije imaju RLS pravila za vlastiti `user_id` i sudjelovanje u razgovoru.
- Na `private_messages` postoje okidači za obavijesti, identitet pri izmjeni, ažuriranje vremena i provjeru odgovora.

## Nedostatak koji je potrebno riješiti

U trenutku provjere nije postojao okidač na `private_messages` koji odbija nove poruke kada je između pošiljatelja i primatelja aktivna blokada. Također nije postojao okidač na `private_message_reactions` koji odbija reakcije u razgovoru između blokiranih članova.

Trenutačna RLS pravila reakcija provjeravaju identitet člana i sudjelovanje u poruci, ali sama po sebi ne provjeravaju tablicu `blocked_users`. Zato blokadu treba provoditi na razini baze, a ne samo sakrivanjem kontrola u sučelju.

## Pripremljeni nacrti

- `docs/sql/private-message-block-guard.sql` — provjera blokade i identiteta pošiljatelja pri umetanju poruke.
- `docs/sql/private-message-reaction-block-guard.sql` — provjera identiteta, sudjelovanja i blokade pri umetanju reakcije.
- `docs/TESTNI-PLAN-SIGURNOSTI.md` — scenariji za provjeru.

## Ograničenja i sljedeći korak

Ovo je nalaz iz kataloga baze, ne test stvarnog korisničkog toka. Nacrti nisu ovim postupkom primijenjeni niti dokazano rade u runtimeu. Prije primjene treba ih testirati na zasebnom Supabase projektu, potvrditi da reakcije, odgovori i obavijesti i dalje rade te provjeriti rezultate negativnih testova. Ne izvršavati na produkciji bez izričitog odobrenja.
