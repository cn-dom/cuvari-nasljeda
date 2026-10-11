# Plan povezivanja Supabasea — PatriaSoul · Čuvari nasljeđa

Ovaj dokument je nacrt za razvojno/testno okruženje. **Ne izvršava SQL, ne mijenja nijedan Supabase projekt i ne sadrži ključeve.** Prije primjene treba potvrditi pravi testni projekt i pregledati pravila pristupa.

## Cilj prve funkcionalne verzije

1. Registracija i prijava preko Supabase Autha.
2. Osnovni profil člana.
3. Objave s tekstom i opcionalnom fotografijom.
4. Komentari i reakcije.
5. Označavanje člana u objavi.
6. Brisanje vlastitih objava i komentara.
7. Prijava sadržaja i administratorsko moderiranje u zasebnoj fazi.

## Predloženi model podataka

### profiles
- id uuid primary key references auth.users(id) on delete cascade
- username text unique not null — normalizirati i provjeriti na poslužitelju
- display_name text not null
- avatar_path text null
- bio text null
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Članovi smiju čitati javne profile. Član smije mijenjati samo vlastiti profil; uloga administratora ne smije se određivati iz korisnički promjenjivih user_metadata podataka.

### posts
- id uuid primary key default gen_random_uuid()
- author_id uuid not null references profiles(id) on delete cascade
- body text not null default ''
- image_path text null
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Odbaciti objavu ako su i tekst i fotografija prazni. Ograničiti duljinu teksta i provjeriti MIME tip i veličinu fotografije na klijentu i poslužitelju. Ne spremati Data URL/base64 slike u tablicu.

### comments
- id uuid primary key default gen_random_uuid()
- post_id uuid not null references posts(id) on delete cascade
- author_id uuid not null references profiles(id) on delete cascade
- body text not null
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Vlasnik komentara smije urediti ili izbrisati samo svoj komentar. Brisanje objave briše njezine komentare kroz strani ključ.

### post_reactions
- post_id uuid not null references posts(id) on delete cascade
- user_id uuid not null references profiles(id) on delete cascade
- reaction text not null check (reaction in ('like','patriotism','gratitude','support'))
- created_at timestamptz not null default now()
- Primarni ključ: (post_id, user_id) — jedna odabrana reakcija po članu i objavi.

### post_mentions
- post_id uuid not null references posts(id) on delete cascade
- mentioned_user_id uuid not null references profiles(id) on delete cascade
- Primarni ključ: (post_id, mentioned_user_id)

Oznake moraju biti stvarni ID-jevi profila, a ne samo tekst poput @ime. Obavijesti se dodaju zasebno uz ograničenje učestalosti.

## Predložena pravila pristupa (RLS)

RLS mora biti uključen na svakoj tablici u izloženoj shemi.

- Profili: javno čitanje samo odobrenih javnih polja; uređivanje isključivo vlastitog retka.
- Objave: čitanje objava dostupnih zajednici; umetanje samo kada je author_id = auth.uid(); uređivanje i brisanje samo vlasniku. UPDATE pravila trebaju i USING i WITH CHECK.
- Komentari: čitanje uz vidljivu objavu; umetanje samo kada je author_id = auth.uid(); uređivanje i brisanje samo autoru.
- Reakcije i oznake: umetanje i brisanje samo za prijavljenog člana koji je vlasnik retka.
- Administratorska prava moraju biti utemeljena na provjerenoj ulozi pohranjenoj u zaštićenim podacima, ne u polju profila koje korisnik može sam promijeniti.

To su pravila dizajna, ne gotove politike za slijepo kopiranje. Prije implementacije treba provjeriti točan model privatnosti, blokiranja i moderiranja.

## Supabase Storage — fotografije

- Privatni bucket community-images za početnu verziju; fotografije poslužiti putem kratkotrajnih potpisanih URL-ova ili kontroliranog pristupa.
- Putanja objekta mora počinjati ID-jem vlasnika, npr. <auth.uid()>/<random-uuid>.webp.
- Dopustiti samo odobrene vrste slika i razumnu granicu veličine; ne vjerovati samo ekstenziji datoteke.
- Pravila Storagea trebaju ograničiti umetanje, zamjenu, čitanje i brisanje prema vlasništvu i pravilima objave.
- Pri brisanju objave očistiti pripadajući objekt uz provjeru vlasništva; baza i Storage nisu jedna atomska transakcija.
- Nikad ne stavljati service_role ili tajni ključ u VITE_ varijable ili preglednik.

## Plan povezivanja bez rizika

1. Potvrditi točan testni Supabase projekt — ne pogađati projekt ID.
2. Napraviti i pregledati migraciju u repozitoriju.
3. Primijeniti je samo na testni projekt.
4. Testirati RLS kao anoniman korisnik, član A i član B (uključujući pokušaj mijenjanja tuđe objave).
5. Testirati Storage: dopušteni upload, prevelika datoteka, lažni MIME tip, tuđa putanja i brisanje.
6. Tek nakon prolaza povezati React aplikaciju; produkciju ne mijenjati bez izričite potvrde.

## Trenutačno stanje

Trenutačni zid, komentari, reakcije, označavanje i fotografije u aplikaciji su prototip. Fotografije se trenutačno obrađuju lokalno radi pregleda, a objave i komentari nisu trajno spremljeni. Ovaj dokument sam po sebi ne povezuje bazu ni ne mijenja pristupne politike.
