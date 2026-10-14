# Sigurnosni nalaz: ovlasti u grupnim razgovorima

Datum provjere: 14. listopada 2026.  
Projekt: Supabase `azerctpwfzdivydsxyex`  
Opseg: samo čitanje aktivnih RLS pravila i definicija funkcija. Nije izvršena promjena baze.

## Nalaz: osnivač može ponovno dobiti administratorsku ulogu nakon predaje ovlasti

**Procjena: potrebno ispraviti prije nego što se prijenos administratorskih ovlasti smatra konačnim.**

Aktivno pravilo `group_chat_members_insert_creator` dopušta INSERT kada vrijedi:

- `is_group_chat_creator(group_id)`,
- novi red ima `role = 'admin'`,
- `user_id = auth.uid()`.

Funkcija `is_group_chat_creator()` provjerava samo je li korisnik upisan kao `group_chats.created_by`; ne provjerava je li još član grupe ili aktualni administrator.

Aktivna funkcija `transfer_group_chat_admin()` može prvotnog administratora spustiti na `member`, ali ne mijenja `group_chats.created_by`. Funkcija `leave_group_chat()` dopušta članu napuštanje grupe i briše njegov red članstva. Nakon što osnivač napusti grupu, gore navedeno INSERT pravilo i dalje ga prepoznaje kao osnivača te mu načelno dopušta da ponovno umetne vlastiti red s ulogom `admin`.

To znači da prijenos administratorske uloge ne uklanja osnivačevo trajno pravo ponovnog postavljanja samoga sebe za administratora nakon napuštanja i ponovnog ulaska. Ovo nije potvrđeno izvođenjem stvarnog korisničkog napada; zaključak proizlazi iz aktivnih definicija pravila i funkcija.

## Preporučeni popravak

1. Odrediti željeno pravilo proizvoda: treba li `created_by` biti samo povijesni podatak ili trajni dokaz posebnih ovlasti.
2. Ako je prijenos ovlasti konačan, izmijeniti pravilo za INSERT tako da samo aktualni član s dopuštenim administratorskim ovlastima može dodavati članove, a osnivač može inicijalno dodati samoga sebe samo u kontroliranom tijeku stvaranja grupe.
3. Razmotriti ograničenu RPC funkciju za inicijalno članstvo koja provjerava da grupa nema članova i da je pozivatelj osnivač, umjesto trajne iznimke osnivača u RLS pravilu.
4. U izoliranom testnom projektu provjeriti: stvaranje grupe, prijenos administratora, napuštanje grupe od strane izvornog osnivača, pokušaj ponovnog INSERT-a vlastitog administratorskog članstva te običan poziv člana.
5. Provjeriti i da funkcija prijenosa ne ostavlja nenamjerne mogućnosti promjene uloga putem izravnih upita.

## Što nije mijenjano

- Nisu izvršeni INSERT, UPDATE, DELETE, DDL ni migracije u Supabaseu.
- Nisu mijenjana aktivna RLS pravila ni funkcije.
- Ovaj dokument je nalaz i plan provjere, a ne dokaz da je popravak implementiran.
