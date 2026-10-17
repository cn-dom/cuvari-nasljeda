# PatriaSoul Video arhiva

Nova samostalna ruta: `/video-arhiva.html`.

## Prva iteracija
- Responzivno sučelje za mobitel i računalo, uz pregled na TV pregledniku.
- Ugrađeni YouTube player; video ostaje na YouTubeu, ne kopira se na PatriaSoul server.
- Kategorije, pretraživanje, sortiranje, prikaz kartica/popisa, favoriti, popis za kasnije i povijest gledanja.
- Obrazac za dodavanje poveznice, naslova, kategorije, izvora, datuma i opisa.
- Trenutačna iteracija sprema biblioteku i korisničke liste u `localStorage` samo na tom pregledniku/uređaju.

## Važno prije produkcije
- Lokalna pohrana nije zajednička između uređaja ni korisnika i nije administratorska zaštita. Nemoj je predstavljati kao sinkroniziranu ili sigurnu administraciju.
- Sljedeća faza treba dodati Supabase tablice za video zapise, liste i povijest, RLS pravila te ograničiti uređivanje na administratorsku ulogu. Prvo potvrditi zaseban testni Supabase projekt; ne pokretati migraciju na produkcijskoj bazi naslijepo.
- Za YouTube pretraživanje automatski putem API-ja potreban je YouTube Data API ključ na sigurnom backendu/Cloudflare Workeru. Bez API-ja ova iteracija prima poveznice ručno.
- Neki videozapisi ne dopuštaju ugrađivanje, mogu biti ograničeni po dobi/regiji ili uklonjeni.
- Uz svaki zapis treba čuvati izvor, autora, opis i povijesni kontekst. Ugrađivanje ne daje pravo na kopiranje ili ponovno objavljivanje tuđeg sadržaja.
- Ne unositi eksplicitne prizore nasilja kao promotivne sličice; pristup arhivi treba ostati dokumentaran i dostojanstven.

## Provjera
Izraditi projekt i provesti browser smoke test za `/video-arhiva.html`, dodavanje/uklanjanje zapisa, validaciju URL-a, filtre i otvaranje ugrađenog playera.
