# Sigurno povezivanje YouTube pretrage

Video arhiva podržava otkrivanje javnih YouTube videozapisa preko poslužiteljskog endpointa. Frontend čita samo javni URL endpointa iz `VITE_YOUTUBE_SEARCH_ENDPOINT`; YouTube API ključ nikada ne smije biti u `VITE_*` varijabli niti u pregledniku.

## Konfiguracija

Postavi `VITE_YOUTUBE_SEARCH_ENDPOINT` na HTTPS URL vlastitog Cloudflare Worker/Pages Function ili Supabase Edge Function endpointa. API ključ `YOUTUBE_API_KEY` konfigurira se isključivo kao tajna na poslužitelju.

Endpoint prima GET parametar `q` (pojam pretrage), poziva YouTube Data API v3 `search.list` s `part=snippet`, `type=video`, ograničenim `maxResults` i vraća JSON. Očekivani odgovor:

```json
{
  "items": [
    {
      "id": { "videoId": "VIDEO_ID" },
      "snippet": {
        "title": "Naslov videa",
        "description": "Opis videa",
        "channelTitle": "Kanal",
        "publishedAt": "2026-01-01T00:00:00Z",
        "thumbnails": { "high": { "url": "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg" } }
      }
    }
  ]
}
```

## Sigurnosne i uredničke napomene

- Endpoint mora validirati i ograničiti duljinu `q`, broj rezultata, CORS dopuštene izvore i učestalost poziva.
- Ne vraćaj API ključ u odgovoru ili logovima. Dodaj cache kako bi se štedila YouTube kvota.
- Pretraga samo predlaže rezultate. Ne objavljuj automatski videozapise u zajedničkoj arhivi.
- Prije dodavanja provjeri kanal/izvor, naslov, opis, kontekst i relevantnost. Ne preuzimaj niti ponovno postavljaj tuđe videozapise bez dopuštenja.
- Neki videozapisi ne dopuštaju ugrađivanje; u tom slučaju ponudi poveznicu na YouTube.
- Trenutačna biblioteka i popisi omiljenih/spremanja ostaju lokalni u pregledniku. Za sinkronizaciju između uređaja potrebna je zasebna Supabase tablica s pravilima RLS.


## Ugrađeni Cloudflare endpoint

Aplikacija sada zadano poziva `/api/youtube-search`, a datoteka `functions/api/youtube-search.js` obrađuje zahtjev na poslužitelju. Time API ključ ne ulazi u JavaScript koji se šalje pregledniku. Za aktivaciju u Cloudflare Pages projektu postavi tajnu:

```sh
npx wrangler pages secret put YOUTUBE_API_KEY --project-name cuvari-nasljeda
```

Kad Wrangler zatraži vrijednost, zalijepi YouTube Data API v3 ključ. Nemoj ga slati u chat, spremati u repozitorij ili stavljati u varijablu koja počinje s `VITE_`. Provjeri i da je YouTube Data API v3 uključen u Google Cloud projektu te da API ključ ima odgovarajuća ograničenja. Nakon objave funkcije i postavljanja tajne, pretraga vraća do 12 rezultata po upitu i kratko ih predmemorira. Ako se ključ ne postavi, sučelje će prikazati jasnu poruku umjesto da pretraga tiho ne radi.

Gumb **Dodaj sve rezultate** uvozi rezultate trenutačne pretrage u lokalnu biblioteku jednim klikom. To nije javna objava; zapisi se zasad čuvaju samo u pregledniku na kojem ih dodaješ. Preporučujemo da prije grupnog dodavanja provjeriš pojam pretrage i rezultate.
