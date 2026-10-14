# Završna kontrola — Čuvari nasljeđa
Datum provjere: 14. 10. 2026.
Repozitorij: https://github.com/cn-dom/cuvari-nasljeda
Okruženje: Cloudflare Workers preview/live URL i povezani Supabase projekt pregledani iz izvornog koda i SQL metapodataka.

Oznake:
- [x] Potvrđeno pregledom koda, GitHub Actions ili stvarnog Supabase stanja.
- [ ] Još nije potvrđeno ili zahtijeva dodatni rad/test u pregledniku.
- [!] Važno prije nego što se aplikacija proglasi spremnom za javni rad.

## 1. Gotovo / potvrđeno

- [x] Najnoviji GitHub Actions build za commit `f991965db75039cfb59bcf80c8891b16fb346ae1` prošao je uspješno, uključujući `npm run build` i izgradnju kviza.
- [x] Logo PatriaSoul za plutajući Domoljubni chat postavljen je na `/assets/images/logo%20Patriasoul.png`; datoteka postoji u repozitoriju.
- [x] U repozitoriju postoji React/Vite aplikacija i ugrađena aplikacija kviza.
- [x] `.env.example` koristi samo javne Supabase klijentske vrijednosti i izričito upozorava da se ne koristi service-role/secret ključ u pregledniku.
- [x] Stvarni Supabase projekt sadrži osnovne tablice za profile, zid (`posts`, `comments`, `post_reactions`), privatne poruke, grupne razgovore, forum, stranice, događaje, obavijesti, kviz, blokirane članove, prijave sadržaja i oglasnik pomoći.
- [x] Stvarni Supabase projekt sadrži tablice plutajućeg chata: `community_global_chat_messages`, `community_chat_preferences`, `community_global_chat_reports` i `community_friend_requests`.
- [x] RLS pravila postoje za glavne tablice zida, profila, privatnih i grupnih poruka, zahtjeva za prijateljstvo i plutajućeg chata.
- [x] Supabase Storage ima bucket `community-images` postavljen kao privatan, ograničenje 10 MiB i ograničene tipove slika; bucket `avatars` je javan i ograničen na 10 MiB. Javni avatar bucket može biti namjeran zbog prikaza avatara, ali URL-ovi avatara tada nisu privatni.
- [x] Za privatne poruke pronađeno je pravilo čitanja sudionicima razgovora; grupne poruke imaju pravila vezana uz članstvo grupe.
- [x] Postoje kontrolni dokumenti za testiranje, arhitekturu i sigurnosni pregled.

## 2. Otvoreno — potrebno ručno testiranje

Ove stavke ne mogu se potvrditi samo uspješnim buildom ili pregledom SQL-a.

- [ ] Registracija novog testnog računa, potvrda e-pošte i prijava.
- [ ] Odjava, obnova lozinke i obnavljanje sesije nakon ponovnog učitavanja.
- [ ] Profil: promjena imena, korisničkog imena, opisa i avatara; provjera nakon nove prijave.
- [ ] Zid: objava teksta/slike, uređivanje i brisanje vlastite objave.
- [ ] Komentari i reakcije: stvarno spremanje, osvježavanje i provjera da gost ne može pisati ni reagirati.
- [ ] Blokiranje člana i provjera prikaza zida s dva odvojena testna računa.
- [ ] Prijava sadržaja i cjelovit tijek pregleda u administraciji.
- [ ] Privatne poruke i grupni razgovori između najmanje dva računa; uređivanje/brisanje i reakcije.
- [ ] Forum, stranice, događaji i potvrda/poništenje dolaska.
- [ ] Kviz: zajednička sesija s mrežom, pitanja, bodovanje, XP, dnevni pokušaj i rang-lista.
- [ ] Administracija: provjeriti vlasnički račun i obični račun; obični račun ne smije pozvati administratorske radnje ni izravno kroz API.
- [ ] Plutajući chat: slanje poruke, real-time ažuriranje u drugom pregledniku, utišavanje, zahtjev za prijateljstvo i odgovor na zahtjev.
- [ ] Prikaz na mobitelu, tipkovnička pristupačnost, konzola preglednika i mrežne greške.
- [ ] Potvrditi da je posljednji build i na željenom Cloudflare URL-u, a ne samo zelen u GitHub Actions.

## 3. Važne stavke prije javnog puštanja

- [!] **Moderacija prijava iz plutajućeg chata:** tablica i RLS postoje, a korisnik može prijaviti poruku. U pregledanom glavnom sučelju nije potvrđen administratorski popis i tijek rješavanja baš za `community_global_chat_reports`. Potrebno je dodati/ potvrditi prikaz prijava, promjenu statusa i test prava vlasnika.
- [!] **Provjera SECURITY DEFINER funkcija:** u bazi je pronađeno više funkcija s `SECURITY DEFINER` koje imaju EXECUTE dozvolu za `authenticated`. To samo po sebi nije dokaz ranjivosti, ali tijelo, argumente i autorizaciju svake funkcije treba provjeriti, posebno administratorske funkcije, kviz i `create_community_notification`.
- [!] **Supabase Auth:** raniji sigurnosni pregled bilježi upozorenje da zaštita od poznatih kompromitiranih lozinki nije uključena. Provjeriti i uključiti kroz Auth postavke nakon provjere utjecaja na registraciju/prijavu.
- [!] **Pristup zidu i slikama:** postojeća pravila čitanja zida i komentara dopuštaju anoniman SELECT, što odgovara ranijem zahtjevu da posjetitelji mogu vidjeti zid, ali ne mogu sudjelovati. Ipak, treba testirati u privatnom prozoru da gost ne može pisati, komentirati, reagirati ili dohvatiti privatne podatke.
- [!] **Storage fotografija:** `community-images` je privatan, ali postoji SELECT politika za anon i authenticated. Provjeriti točan način posluživanja slika i osigurati da privatne fotografije nisu dostupne trajnim javnim URL-om; uskladiti RLS i potpisane URL-ove s pravilom vidljivosti sadržaja.
- [!] **Duplikati zahtjeva za prijateljstvo:** baza ima jedinstvenost po smjeru (`sender_id, recipient_id`), a aplikacija provjerava postojeći zahtjev. Treba testirati istodobne zahtjeve u oba smjera i razmotriti jedinstveno pravilo za nedovršeni par zahtjeva.
- [!] **Stvarni prijateljski odnos:** prihvaćanje zahtjeva u plutajućem chatu sprema status zahtjeva; potrebno je potvrditi da se to sinkronizira sa sustavom prijatelja/profila i da se ne stvara odvojen, nepovezan popis prijatelja.

## 4. Trenutačna procjena

**Izgradnja:** GOTOVO / PROLAZI.

**Vizualni temelj i osnovne komponente:** IMPLEMENTIRANO u kodu; završnu provjeru izgleda na različitim uređajima treba ručno potvrditi.

**Supabase povezivanje i osnovne tablice:** POSTOJE u stvarnom projektu; to ne znači da je svaki tijek rada end-to-end potvrđen.

**Spremnost za javno puštanje:** JOŠ NIJE POTVRĐENA. Prvo zatvoriti važne stavke iz odjeljka 3 i provesti ručne testove iz odjeljka 2 s najmanje dva obična testna računa i jednim vlasničkim računom.

Ovaj dokument bilježi stanje u trenutku pregleda. Ne označavati neispitane stavke kao gotove samo zato što je izgradnja prošla.
