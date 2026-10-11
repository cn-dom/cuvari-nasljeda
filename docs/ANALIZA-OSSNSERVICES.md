# Analiza: OSSN Services kao inspiracija za PatriaSoul

Datum provjere: 11. listopada 2026.

Izvor: https://github.com/opensource-socialnetwork/OssnServices  
README: https://github.com/opensource-socialnetwork/OssnServices/blob/master/README.md  
Licenca navedena u izvornom kodu: OSSN License — https://www.opensource-social-network.org/licence

## Zaključak

OssnServices je dodatak pisan za PHP platformu Open Source Social Network (OSSN). Izlaže API krajnje točke kako bi se OSSN mreža mogla povezati s drugim aplikacijama. To je korisna **funkcionalna inspiracija**, ali nije dodatak koji se može izravno instalirati u naš React/Vite + Cloudflare Pages + Supabase projekt.

GitHub metapodaci za repozitorij ne navode standardnu licencu, dok zaglavlje PHP datoteke navodi OSSN License. Zato prije kopiranja ili prilagodbe izvornog koda treba zasebno provjeriti uvjete te licence i kompatibilnost s našim projektom. U ovom projektu zasad se ne kopira izvorni kod iz OssnServicesa.

## Funkcionalnosti koje vrijedi preslikati

| OSSN Services mogućnost | PatriaSoul pristup |
|---|---|
| Dohvat objava zida | Supabase upit nad objavama, uz RLS i provjeru prava pristupa |
| Dodavanje, uređivanje i brisanje objava | Već djelomično implementirano; samo vlasnik smije mijenjati ili brisati vlastitu objavu |
| Komentari | Već je povezana trajna pohrana komentara; zadržati provjeru vlasništva i pristupa objavi |
| Reakcije na objave | Već je povezana tablica `post_reactions`; jedna reakcija po korisniku i objavi |
| Korisnički podaci/profil | Tablica `profiles`; nikad ne izlagati privatne podatke ili administratorske tajne |
| Fotografije | Privatni Supabase Storage; provjera vrste i veličine datoteke, vlasništva i pristupa |
| Grupe i članstva | Budući zasebni model tablica za grupe, članstva i zahtjeve |
| Privatne poruke | Budući model razgovora/poruka s pravilima da poruke vide samo sudionici |
| Obavijesti | Budući model obavijesti s pravilima da korisnik vidi samo svoje |
| Blokiranje korisnika | Budući model blokiranja i provjere u svim relevantnim upitima |
| API verzije i standardni odgovori | Ako se uvedu Cloudflare Pages Functions, koristiti verzionirane rute, validaciju ulaza i dosljedne JSON odgovore |

## Arhitektura za našu infrastrukturu

- **React/Vite** ostaje sučelje.
- **Supabase Auth** upravlja prijavom i sesijom.
- **Supabase Postgres + RLS** provodi autorizaciju podataka; skrivanje gumba u sučelju nije sigurnosna zaštita.
- **Supabase Storage** čuva fotografije u privatnom spremištu.
- **Cloudflare Pages Functions** dodavati samo kada je potreban serverski posrednik, dodatna validacija, zaštita od zlouporabe ili integracija s vanjskim API-jem.
- Nikad ne slati Supabase service-role ključ u preglednik. Funkcije na klijentu koriste samo javni publishable/anon ključ uz pravilno postavljene RLS politike.

## Sigurnosne provjere prije širenja API-ja

1. Svaku promjenu podataka provjeriti na poslužitelju i kroz RLS, ne samo u UI-ju.
2. Provjeriti da korisnik ne može mijenjati ID autora, čitati privatne razgovore ili brisati tuđe objave.
3. Ograničiti veličinu i MIME vrste datoteka te provjeriti putanju u privatnom spremištu.
4. Dodati ograničavanje učestalosti zahtjeva i validaciju podataka na serverskim rutama gdje je potrebno.
5. Ne vraćati lozinke, tokene, interne postavke ni nepotrebne osobne podatke u API odgovorima.
6. Testirati svaku novu rutu kao anonimni korisnik, prijavljeni korisnik, vlasnik i drugi korisnik.

## Redoslijed rada

1. Provjeriti da CI prolazi nakon posljednjih promjena zida, komentara, reakcija i fotografija.
2. Dovršiti sigurnosne testove postojećih funkcionalnosti.
3. Dodati blokiranje/prijavu sadržaja i administratorsko moderiranje prije nego što se otvore šire API mogućnosti.
4. Nakon toga implementirati grupe, poruke i obavijesti kao zasebne funkcionalnosti.
5. Sve razvijati na radnoj grani; ne primjenjivati SQL na produkcijsku bazu i ne objavljivati produkciju bez izričite potvrde.

## Napomena o statusu

Ovaj dokument je tehnička analiza i plan. Ne instalira OSSN, ne kopira njihov PHP kod, ne mijenja produkciju i ne izvršava SQL u Supabaseu.
