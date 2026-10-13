# Supabase — dodatni pregled RPC-a, RLS-a i profila

**Datum pregleda:** 13. listopada 2026.  
**Vrsta pregleda:** samo čitanje; nisu mijenjani podaci, funkcije, privilegije ni RLS pravila.

## Sažetak

- Kviz RPC funkcije za pokušaje i rezultate postoje u projektu `kviz`; nisu pronađene u `Patriasoul's Project` među provjerenim imenima.
- Pregledane kviz funkcije koje mijenjaju stanje koriste `SECURITY DEFINER` i provjeravaju prijavu/vlasništvo pokušaja. Administratorske RPC funkcije `admin_dashboard_stats` i `admin_list_users` provjeravaju `public.is_admin()`.
- U projektu `kviz`, tablica `profiles` ima javnu SELECT politiku s uvjetom `true`. To znači da profilna polja dostupna kroz ovu tablicu mogu biti čitljiva i neprijavljenima; potvrditi da su sva polja u toj tablici namijenjena javnosti.
- Politike `quiz_results_insert_own` i `quiz_results_select_own` dodijeljene su ulozi `public`, ali uvjeti traže da `auth.uid() = user_id`. Anonimni poziv bez korisničkog identiteta ne bi zadovoljio taj uvjet. Ipak, nakon testova preporučuje se procijeniti ograničavanje tih politika na `authenticated` radi načela najmanjih ovlasti.
- Na `profiles` postoje dva okidača za zaštitu promjene `role`: `guard_profile_role_change` i `prevent_profile_role_escalation`. Oba provjeravaju e-mail vlasnika `patriasoul@protonmail.com`; izgledaju funkcionalno redundantno. Ne uklanjati nijedan bez pregleda migracija i testova.

## Provjerene RPC funkcije u projektu `kviz`

| Funkcija | Potpis (sažeto) | Zapažanje |
|---|---|---|
| `start_quiz_attempt` | vrsta kviza, kategorija, grad | Traži prijavu, provjerava vrstu i dostupnost pitanja te veže pokušaj uz prijavljenog korisnika. |
| `submit_quiz_answer` | ID pokušaja, pitanje, indeks odgovora | Traži prijavu i provjerava da je pokušaj aktivan te pripada korisniku. |
| `finish_quiz_attempt` | ID pokušaja | Traži prijavu i zaključava pokušaj koji pripada korisniku; računa rezultat na temelju pohranjenih odgovora. |
| `record_quiz_result` | vrsta, kategorija, grad, rezultat, vrijeme | Traži prijavu i provjerava granice rezultata i kontekst kviza. |
| `get_leaderboard` | vrsta kviza, limit | `SECURITY DEFINER`; vraća agregirane rezultate i ograničava limit na najviše 100. |
| `admin_dashboard_stats` | bez argumenata | Provjerava `public.is_admin()` prije vraćanja statistike. |
| `admin_list_users` | bez argumenata | Provjerava `public.is_admin()` prije vraćanja podataka korisnika. |
| `create_community_notification` | korisnik, komentar, vrsta | Traži prijavu i ne stvara obavijest korisniku koji sam poziva funkciju. |

Ovaj pregled nije potpuna sigurnosna revizija svih funkcija ili prava EXECUTE. Prije produkcijskih promjena treba provjeriti i dozvole izvršavanja, sve pomoćne funkcije, RLS na svim uključenim tablicama i testove uloga.

## RLS nalazi za društveni zid

- `community_posts`: čitanje za prijavljene članove filtrira objave prema statusu, autorstvu/moderatorskoj ulozi i blokadama; unos provjerava autora i status objave.
- `community_comments`: neprijavljeni mogu čitati komentare sa statusom `published`; prijavljeni mogu čitati objavljene komentare, svoje komentare i komentare dostupne moderatoru.
- `community_notifications`: čitanje i označavanje pročitano ograničeni su na `user_id = auth.uid()`.
- `profiles`: javno čitanje dopuštenо je trenutačnom pravilu; izmjena vlastitog profila dodatno je zaštićena okidačima koji sprječavaju neovlaštenu promjenu uloge.

## Sljedeći sigurni koraci

1. Potvrditi da su sva polja tablice `profiles` prikladna za javno čitanje; privatne podatke držati u zasebnoj tablici s užim pravilima.
2. U razvojnoj bazi testirati anoniman SELECT/INSERT na `quiz_results` te prijavljene pozive i potvrditi da pravila odgovaraju namjeri.
3. Pregledati sve funkcije `SECURITY DEFINER`, EXECUTE privilegije i pomoćne funkcije prije bilo kakve izmjene.
4. Ostaviti produkcijske politike i okidače nepromijenjene do dovršetka testova i izričitog odobrenja.

## Važno

Ovaj dokument bilježi zapažanja iz metapodataka i definicija funkcija dostupnih kroz read-only upite. Nije izvršen pokušaj eskalacije uloge, nije slan testni upit kao anoniman korisnik i nije promijenjena nijedna politika.
