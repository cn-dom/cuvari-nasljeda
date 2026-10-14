# Sigurnosni pregled administratorskih RPC funkcija

Datum pregleda: 2026-10-14

## Sažetak

Pregledane su funkcije koje Supabase sigurnosni savjetnik označava zato što su SECURITY DEFINER i izvršive za ulogu authenticated. Sama oznaka nije dokaz ranjivosti: bitno je provjeriti da funkcija provjerava ovlasti prije pristupa ili promjene zaštićenih podataka.

## Provjere potvrđene u definicijama baze

- admin_dashboard_stats(), admin_delete_quiz_result(uuid), admin_list_quiz_results() i admin_list_users() provjeravaju postoji li prijavljeni korisnik u public.profiles s role = 'admin' prije izvršavanja administratorske radnje.
- admin_group_chat_members(uuid), admin_group_chat_overview(), admin_log_event(...) i admin_remove_group_chat_member(uuid, uuid) provjeravaju vlasničku adresu iz JWT-a prije izvršavanja.
- create_community_notification(...) provjerava prijavu, autorstvo komentara i uvjete za spominjanje/odgovor.
- finish_quiz_attempt(uuid), submit_quiz_answer(uuid, uuid, integer) i start_quiz_attempt(...) provjeravaju identitet i vlasništvo pokušaja; bodovi se računaju u bazi.
- Funkcije članstva u grupnom razgovoru ograničavaju radnje na članove, administratore ili osnivača, ovisno o operaciji.

## Promjena napravljena u repozitoriju

Stari klijentski pomoćnik saveQuizResult uklonjen je iz kviz/src/lib/results.js, jer je upisivao rezultat koji je preglednik sam poslao. Pripremljena je zasebna SQL migracija docs/sql/revoke-legacy-quiz-result.sql za opoziv EXECUTE prava na staru funkciju record_quiz_result(...).

## Što nije učinjeno

- Nije mijenjana produkcijska baza.
- SQL migracija za stari RPC nije primijenjena.
- Nije provedeno testiranje s računom običnog člana i vlasničkim računom u stvarnom pregledniku.

## Preporučeni sljedeći koraci

1. Primijeniti SQL migraciju na zasebnom testnom Supabase projektu i potvrditi da su anon_exec i authenticated_exec za stari RPC false.
2. Testirati pozive administratorskih RPC funkcija običnim članom i potvrditi da svi vraćaju odbijanje ovlasti.
3. Ponovno pokrenuti Supabase Security Advisor nakon migracije. Njegovo generičko upozorenje za izvršive SECURITY DEFINER funkcije može ostati i kad su provjere ovlasti ispravne.
4. Zasebno provjeriti politike RLS za privatne poruke, komentare, prijave i rezultate kviza.