# Standard za PatriaSoul module

Ova mapa dokumentira pravila za buduće dodatke. Svaki dodatak mora biti neovisan, siguran i nadogradiv.

## Planirani moduli

- `patriasoul-community`: profili, Zid, forum/grupe, komentari, privatne poruke i obavijesti.
- `patriasoul-quiz`: Hrvatski kviz, Brani svoj grad, Dnevni kviz, pokušaji, bodovi, značke i rang-liste.
- `patriasoul-media`: videoarhiv, glazbeni player, omiljeno, red reprodukcije i komentari.
- `patriasoul-integrations`: adapteri prema postojećim servisima; tajne ostaju u sigurnoj konfiguraciji poslužitelja.

## Obvezno prije spajanja

- PHP lint i WordPress Coding Standards gdje je moguće.
- Nonce, ovlasti, sanitizacija, escaping i RLS/server-side authorization.
- Idempotentna instalacija; bez brisanja podataka na aktivaciji/deaktivaciji.
- Kratki kodovi/blokovi i postavke s jedinstvenim prefiksom.
- Jasna provjera ovisnosti o Core-u.
- Testiranje bez modula, s modulom deaktiviranim i s modulom aktivnim.
- Opis migracije, rollbacka i promjena baze.

**Važno:** mapa u planu nije dokaz da je modul već implementiran. Ne instalirati nepostojeće module niti uklanjati postojeću aplikaciju dok migracija nije dovršena.
