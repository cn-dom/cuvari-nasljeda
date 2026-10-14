# Nalaz: stvaranje grupnog razgovora nije atomska operacija

Datum provjere: 14. listopada 2026.  
Repozitorij: `cn-dom/cuvari-nasljeda`  
Datoteka pregledana: `src/App.jsx`  
Opseg: pregled izvornog koda i aktivnih RLS pravila; bez promjene baze.

## Što je pronađeno

Funkcija `createGroupChat()` izvodi stvaranje grupe u nekoliko zasebnih zahtjeva:

1. stvara red u `group_chats`;
2. zasebno dodaje osnivača u `group_chat_members` kao administratora;
3. zasebno dodaje odabrane članove.

Ako drugi zahtjev ne uspije, grupa ostaje stvorena bez administratorskog članstva. Ako treći zahtjev ne uspije, grupa i administratorsko članstvo osnivača ostaju, ali odabrani članovi nisu dodani. Trenutačni kod prikazuje obavijest, ali ne poništava ranije uspješne korake.

To je problem pouzdanosti i konzistentnosti podataka; samo po sebi nije dokaz neovlaštenog pristupa.

## Preporučeno rješenje

Najsigurniji dugoročni pristup je jedna RPC funkcija koja u jednoj transakciji:

- provjerava prijavljenog korisnika i naziv grupe;
- stvara grupu;
- dodaje osnivača kao prvog administratora;
- provjerava i dodaje odabrane članove;
- vraća ID i osnovne podatke grupe.

Ako bilo koji korak ne uspije, transakcija se poništava i ne ostaje djelomično stvorena grupa. Funkcija mora koristiti `auth.uid()` za identitet osnivača, a ne vjerovati ID-u koji pošalje preglednik.

## Obvezne provjere u testnom projektu

- Uspješno stvaranje grupe s jednim ili više članova.
- Nevaljan ili nepostojeći ID člana poništava cijelo stvaranje.
- Neprijavljen korisnik ne može stvoriti grupu.
- Korisnik ne može dodijeliti drugoj osobi ulogu administratora.
- Nakon neuspjeha nema zaostale grupe ni djelomičnih članstava.
- Postojeći UI i obavijesti rade s odgovorom nove RPC funkcije.

## Status

Nije mijenjan `src/App.jsx`, SQL ni aktivna Supabase baza. Ovo je nalaz za sljedeći kontrolirani popravak, koji treba pripremiti i provjeriti u izoliranom testnom projektu prije produkcije.
