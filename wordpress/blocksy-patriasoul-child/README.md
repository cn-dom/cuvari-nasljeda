# Blocksy Child – PatriaSoul (razvojna osnova)

Ovo je početna podtema za postojeću instalaciju Blocksyja. Ne sadrži Blocksy roditeljsku temu i nije završni ZIP za instalaciju.

## Namjena
- Prenijeti postojeći PatriaSoul izgled u WordPress, bez izmišljanja novog zaglavlja ili podnožja.
- Sačuvati postojeće tekstove, redoslijed i nazive u zaglavlju, navigaciji i podnožju; ne skraćivati ih, prepravljati ni zamjenjivati generičkim tekstom.
- Sačuvati postojeći identitet i službeni logotip, kao i prepoznatljivu hrvatsku crveno-bijelo-plavu crtu.
- Ujednačiti prikaz službenog logotipa na računalu i mobitelu te dodati vidljiv fokus za tipkovničku navigaciju.
- Zadržati Blocksy Customizer i uređivanje sadržaja u WordPressu.
- Registrirati zasebne opcionalne lokacije za glavni izbornik i izbornik podnožja PatriaSoul, bez mijenjanja postojećih Blocksy postavki.

## Tekst zaglavlja i podnožja — obvezno
Pri prijenosu treba usporediti tekst s postojećom PatriaSoul stranicom i prenijeti ga doslovno. Posebno sačuvati postojeći tekst podnožja:
- „Hrvatska · povijest · znanje · identitet”
- „Znanje · Ponos · Nasljeđe”

Ne uvoditi alternativne slogane, nove naslove ni zamjenske oznake umjesto postojećih. Zaglavlje, navigacija i podnožje moraju izgledati kao na sadašnjoj stranici, uz prilagodbu responzivnom prikazu WordPressa. Tekst treba ostati uređiv u WordPressu.

## Prilagodljivost teme
- Paleta boja PatriaSoul dostupna je i u WordPress blok-uređivaču.
- Podtema dodaje responzivne prilagodbe logotipa, diskretnu hrvatsku crveno-bijelo-plavu crtu i vidljive indikatore fokusa za tipkovnicu.
- Dodatne lokacije izbornika mogu se dodijeliti u WordPressu, ali Blocksy i dalje upravlja stvarnim rasporedom zaglavlja i podnožja.

## Kriteriji za proglašenje teme gotovom

Tema se neće označiti kao gotova samo zato što prolazi statičku provjeru. Prije završnog ZIP-a moraju biti potvrđene sve stavke:

- [ ] službeni PatriaSoul logo uključen ili pouzdano postavljen bez tekstualne zamjene
- [ ] stvarno zaglavlje i podnožje uspoređeni s postojećom aplikacijom, uključujući doslovan tekst i redoslijed
- [ ] desktop, tablet i mobilni prikaz provjereni u WordPressu s Blocksyjem
- [ ] glavni i mobilni izbornik rade, bez ručnog popravljanja nakon instalacije
- [ ] podnožje prikazuje oba dogovorena reda i može se uređivati
- [ ] stranice i sadržaj ostaju uređivi kroz WordPress
- [ ] provjera aktivacije, deaktivacije i instalacije u čistom testnom WordPressu
- [ ] svi automatizirani testovi prolaze

Trenutačno je tema razvojna osnova verzije 0.2.0. CSS i paleta uređivača su pripremljeni, ali još nije potvrđen potpuni vizualni paritet niti instalacija bez ručnih zahvata. Ne smatra se gotovom.

## Važno
1. Roditeljska tema `blocksy` mora već biti instalirana.
2. Službeni logotip postavlja se kroz **Izgled → Prilagodi → Identitet web-mjesta**; tema ne izmišlja tekstualni logotip i ne ugrađuje kopiju slike.
3. Ovo je razvojna osnova, ne dovršena tema. Zaglavlje, podnožje, navigacija i predlošci još zahtijevaju vizualnu provjeru na testnoj WordPress instalaciji.
4. Funkcionalnosti kviza, članova, muzeja i registra ne smiju ovisiti o ovoj temi; one pripadaju zasebnom dodatku.
5. Ne instalirati kao završno rješenje dok se ne obave testovi na testnoj stranici.
