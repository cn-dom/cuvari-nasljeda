# Povezivanje PatriaSoul kviza i Čuvara nasljeđa

## Što je povezano u kodu

- Kviz se gradi u istoj aplikaciji na putanji `/kviz/`.
- Kviz uvozi isti Supabase klijent iz `src/lib/supabase.js` kao društvena mreža. Time se dijele URL projekta, autentifikacijska sesija, pohrana tokena i stanje prijave.
- OAuth i e-mail povratak iz prijave kviza vode na trenutni origin i putanju kviza, a ne na stari portal.
- Službeni logo mreže i kviza nalazi se u `public/assets/images/1000000982.png`.
- Kviz zadržava postojeće funkcije, ali njegove tablice/RPC-ovi moraju postojati u odabranom Supabase projektu.

## Potrebne postavke za Cloudflare Worker i GitHub Actions

Vite ugrađuje ove vrijednosti tijekom izgradnje statičke aplikacije. Ako izgradnju pokreće GitHub Actions, vrijednosti moraju biti dostupne tom workflowu kao GitHub Actions secrets; samo postavljanje varijabli u Cloudflare Worker postavkama ne mijenja već izgrađeni JavaScript bundle.

- `VITE_SUPABASE_URL`: URL odvojenog testnog Supabase projekta.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: javni/publishable ključ istog projekta.

Ne koristiti `service_role` ni secret ključ u `VITE_*` varijablama. Prijava, Google OAuth i e-mail potvrde moraju imati dopuštene URL-ove u Supabase Auth postavkama, uključujući domenu aplikacije i povratni URL `/kviz/`.

## Provjere baze prije puštanja

Kviz koristi sljedeće tablice/poglede i RPC funkcije; ovo je inventar iz klijentskog koda, a ne potvrda da objekti već postoje:

### Tablice i pogledi

- `profiles`
- `player_progress`
- `quiz_results`
- `quiz_questions`
- `quiz_questions_public`
- `cities`
- `city_questions_public`
- `community_comments`
- `community_notifications`

### RPC funkcije

- `start_quiz_attempt`
- `submit_quiz_answer`
- `finish_quiz_attempt`
- `record_quiz_result`
- `get_leaderboard`
- `admin_dashboard_stats`
- `admin_list_users`
- `admin_list_quiz_results`
- `admin_delete_quiz_result`
- `create_community_notification`

## Sigurnosne napomene

- Administratorske funkcije moraju provjeravati ovlasti na strani baze, ne samo sakrivati gumbe u pregledniku.
- Točni odgovori ne smiju biti dostupni kroz javni prikaz pitanja.
- RLS mora ograničiti rezultate, napredak, profilne izmjene i komentare na ovlaštene korisnike.
- Baza pitanja i gradova te njezini izvori moraju se prenijeti ili ponovno uvesti zasebno; njihovi podaci nisu sadržani u samom React kodu.
- Nijedna migracija nije automatski izvršena. Prije SQL promjena odabrati i potvrditi zaseban testni Supabase projekt.
