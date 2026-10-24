# PatriaSoul WordPress migracija — razvojna grana

Ova mapa je razvojni temelj za prijenos u WordPress. Nije završni instalacijski paket i ne treba je instalirati kao cjelinu.

## Što je dodano u ovoj fazi

- Namjenski WordPress dodatak u `wordpress/patriasoul-core/`.
- Dva uređiva tipa sadržaja: muzejski predmeti i dosjei registra Hrvatska pamti.
- Kratki kodovi `[patriasoul_portal]`, `[patriasoul_museum]`, `[patriasoul_memorials]` i `[patriasoul_footer]`.
- Uredivi tekstovi PatriaSoul podnožja u **Postavke → PatriaSoul**. Zadani redovi su „Hrvatska · povijest · znanje · identitet” i „Znanje · Ponos · Nasljeđe”. Kratki kod `[patriasoul_footer]` može se dodati u područje podnožja kroz Blocksy Footer Builder.
- Osnovni tamnoplavi dizajn s diskretnom crveno-bijelo-plavom crtom, karticama i responzivnim rasporedom.
- Postavka javne adrese postojeće aplikacije, bez pohrane API tajni.
- Pri aktivaciji se stvaraju tri početne stranice kao **skice** samo ako slug još ne postoji. Postojeće stranice se ne prepisuju.

## Što ova faza još NE radi

- Ne prenosi postojeće Supabase korisnike, prijavu ili sesije.
- Ne implementira funkcionalni zid, prijateljstva, privatne poruke, obavijesti ili grupne razgovore.
- Ne prenosi sustav kviza, bodove, značke ni njegove RPC funkcije.
- Ne uvozi stvarne muzejske predmete ni dosjee iz postojećeg registra.
- Ne povezuje podatke s postojećom bazom.
- Ne mijenja produkcijsku aplikaciju, Cloudflare ili Supabase.

## Zašto je povezivanje baze odgođeno

Tehnička provjera postojećeg projekta bilježi dva Supabase projekta s različitim shemama. Prije bilo kakve integracije potrebno je utvrditi kanonsku bazu, identitet korisnika, tablice, funkcije, pravila RLS, Storage i preusmjeravanja prijave. Tajni ključevi ne smiju biti dostupni u WordPress sadržaju ili JavaScriptu.

## Lokalna provjera

1. Kopirati mapu `patriasoul-core` u `wp-content/plugins/` u testnom WordPressu.
2. Aktivirati dodatak u administraciji.
3. Provjeriti da su tri stranice dodane kao skice, bez izmjene postojećih stranica.
4. Objaviti željenu skicu tek nakon uređivanja.
5. Dodati probni muzejski predmet i probni dosje; objaviti ih i provjeriti prikaz kratkih kodova.
6. U Blocksy Footer Builder dodati blok/element kratkog koda s `[patriasoul_footer]` i provjeriti oba reda podnožja.
7. Usporediti zaglavlje, navigaciju i podnožje s postojećom PatriaSoul stranicom; tekstove ne prepravljati i ne zamjenjivati.
8. Testirati izgled na mobitelu i računalu te provjeriti logove PHP-a.

Ovaj opis bilježi implementacijski temelj, a ne potvrđuje da su testovi na korisnikovom WordPress hostingu izvršeni.
