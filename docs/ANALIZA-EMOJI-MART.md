# Emoji Mart – provjera izvora i integracija

- Izvor: https://github.com/missive/emoji-mart
- Službena dokumentacija i demo: https://missiveapp.com/open/emoji-mart
- Provjerena verzija iz paketa: `emoji-mart@5.6.0`
- Podaci: `@emoji-mart/data@1.2.1`
- Licenca repozitorija i oba paketa: MIT (provjerena metapodacima repozitorija/paketa).
- Evidencija MIT teksta: [EMOJI-MART-MIT.txt](../licenses/EMOJI-MART-MIT.txt)

## Što koristimo

U postojeći React/Vite projekt integrira se službeni Emoji Mart picker umjesto ograničenog ručnog popisa od 12 emojija. Omogućuje pretraživanje i kategorije, uključujući ljude, prirodu, hranu, aktivnosti, mjesta, predmete, simbole i zastave. Odabrani emoji dodaje se na kraj teksta nove objave.

## Ograničenja i provjera

- Picker je trenutno vezan uz sastavljanje objave; komentari i privatne poruke nisu još povezani s njim.
- Emoji Martov ugrađeni popis lokalizacija ne navodi hrvatski jezik; trenutačno su unutarnji nazivi i pretraživanje na engleskom. To možemo posebno lokalizirati u sljedećem koraku.
- Paket podataka ugrađuje se u frontend bundle, što povećava početnu veličinu preuzimanja. Ako bude preveliko, možemo ga učitavati odvojeno/lijeno.
- Emoji se prikazuju kao nativni znakovi uređaja; izgled zastava može ovisiti o operacijskom sustavu i pregledniku.
- Integracija je na razvojnoj grani. Prije objave treba potvrditi uspješan build i vizualno provjeriti desktop i mobilni prikaz.

Nismo kopirali cijeli projekt Emoji Mart; koristimo objavljene pakete i evidentiramo njihovu licencu.
