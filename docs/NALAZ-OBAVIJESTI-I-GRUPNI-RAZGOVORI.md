# Sigurnosni nalaz — obavijesti i grupni razgovori

Datum provjere: 2026-10-14  
Supabase projekt pregledan samo čitanjem kataloga: `azerctpwfzdivydsxyex`

## Opseg i ograničenja

Pregledani su aktivni triggeri, RLS politike i definicije nekoliko funkcija te uspoređeni s nacrtima u repozitoriju. Nisu izvršene izmjene baze, nisu slane poruke i nisu mijenjani podaci.

## Nalaz 1 — zaštita od blokade u obavijestima nije aktivna u postojećoj funkciji

Aktivna funkcija `public.create_community_notification(uuid, uuid, text)` ima `SECURITY DEFINER`, fiksni prazan `search_path` i dopušta izvršavanje ulozi `authenticated`. Provjerava da je komentar autorov, da vrsta obavijesti vrijedi i da spominjanje/odgovor odgovara sadržaju. U aktivnoj definiciji, međutim, nema provjere tablice `blocked_users`.

Posljedica: ako se pozove postojeća funkcija za valjano spominjanje ili odgovor, ona može upisati `community_notifications` i kad je između autora i primatelja blokada. Nacrt `docs/sql/community-notification-block-guard.sql` dodaje provjeru blokade, ali nije aktivan u pregledanoj bazi.

## Nalaz 2 — automatske obavijesti za oznake u objavama/komentarima nisu registrirane kao triggeri

U aktivnom katalogu nisu pronađeni triggeri `posts_notify_members_mentioned` ni `comments_notify_members_mentioned`, a funkcija `notify_members_mentioned()` nije pronađena. Nacrt `docs/sql/mention-notifications.sql` postoji u repozitoriju, ali nije instaliran u ovom projektu.

To znači da se ne smije pretpostaviti da će oznaka `@korisničko_ime` u objavi ili komentaru automatski stvoriti obavijest. Ovo je nalaz funkcionalnosti, a ne dokaz da je postojeća aplikacija pokvarena u svim drugim vrstama obavijesti.

## Nalaz 3 — grupni razgovori imaju RLS politike i zaštitne triggere, ali RPC zahtijeva zaseban pregled

Aktivne politike za `group_chats`, `group_chat_members`, `group_chat_messages` i `group_chat_message_reactions` ograničene su na prijavljene članove; postoje i triggeri za promjene administratora i poruka. Funkcija `get_group_unread_counts()` je `SECURITY DEFINER`, s isključenim RLS-om unutar funkcije, ali filtrira članstva po `membership.user_id = auth.uid()`. Ne zaključujem da je potpuno sigurna samo na temelju tog filtra: potrebno je testirati da korisnik ne može dobiti brojače grupa kojima ne pripada, uključujući pozive bez valjane sesije.

## Preporučeni sljedeći koraci

1. U zasebnom Supabase testnom projektu primijeniti i testirati nacrt `community-notification-block-guard.sql`.
2. Testirati spominjanje i odgovor u oba smjera blokade; očekivano je da se obavijest ne stvori.
3. Odlučiti želi li se aktivirati `mention-notifications.sql`; ako da, testirati spominjanje, duplikate, nepostojeće korisničko ime, samooznačavanje i blokade.
4. Testirati `get_group_unread_counts()` s članom grupe, nečlanom, više grupa i bez prijavljene sesije.
5. Tek nakon prolaza u testnom projektu razmotriti primjenu na aktivnu bazu uz izričito odobrenje.

## Status

- Ovo je dokumentacija nalaza, nije popravak aktivne baze.
- Nacrti SQL-a nisu izvršeni na produkciji.
- GitHub Actions provjerava repozitorij; sam po sebi ne potvrđuje da su funkcije ili triggeri instalirani u Supabaseu.
