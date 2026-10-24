# PatriaSoul WordPress — modularna arhitektura

## Pravilo organizacije

- **Tema** upravlja samo izgledom: boje, tipografija, logo, raspored, zaglavlje i podnožje.
- **PatriaSoul Core** sadrži zajedničke postavke, početno postavljanje, zajedničke ugovore i pregled modula.
- **Funkcionalni moduli** su zasebni WordPress dodaci: zajednica/forum, kviz, mediji/player i integracije.
- **Virtualni muzej i Hrvatska pamti** trenutačno su u Core temelju; izdvajanje u zasebne module radit će se tek kada sučelja i migracija podataka budu definirani.
- **Rank Math SEO** ostaje zaseban; SEO se ne ugrađuje u PatriaSoul dodatke.

## Struktura

```
wordpress/
  blocksy-patriasoul-child/      # izgled, bez poslovne logike
  patriasoul-core/               # zajednički temelj
    includes/
      class-patriasoul-module-manager.php
    assets/
  patriasoul-community/          # zaseban dodatak (u razvoju)
  patriasoul-quiz/               # zaseban dodatak (u razvoju)
  patriasoul-media/              # zaseban dodatak (u razvoju)
  patriasoul-integrations/       # zaseban dodatak (u razvoju)
  modules/README.md              # ugovor za buduće module
```

## Ugovor za nove module

1. Svaki modul ima vlastitu mapu, glavni PHP file, prefiks `patriasoul-` i jedinstven namespace/prefiks za funkcije, opcije, tablice i kratke kodove.
2. Modul provjerava postoji li PatriaSoul Core i prikazuje razumljivu poruku ako nedostaje; ne ruši WordPress.
3. Svaki upis provjerava nonce i ovlasti; ulaz se sanitizira, izlaz escapira; REST endpointi imaju eksplicitne provjere ovlasti.
4. Ne sprema tajne ključeve u javni JavaScript, sadržaj stranice ili repozitorij.
5. Ne mijenja ni briše postojeće podatke pri aktivaciji/deaktivaciji. Migracije baze moraju biti verzionirane, ponovljive i imati plan povratka.
6. Korisnički identitet i kviz ne smiju se kopirati između Supabase projekata bez provjere veza, RLS-a i RPC funkcija.
7. Modul dodaje svoju administraciju i stranice samo ako slug već ne postoji; nikada ne prepisuje postojeću stranicu.
8. Modul ne smije ovisiti o internim klasama drugog modula; zajednički ugovor ide u Core ili kroz dokumentirani WordPress hook.
9. Testovi provjeravaju aktivaciju, nedostatak Core-a, dozvole, izlaz i deaktivaciju.
10. Prije produkcije: staging test, sigurnosna kopija, potvrđen rollback i ručna provjera na računalu i mobitelu.

## Dodavanje modula u Core pregled

Modul može registrirati stavku kroz filter:

```php
add_filter('patriasoul_core_modules', function ($modules) {
    $modules['example'] = array(
        'name' => 'Primjer modula',
        'slug' => 'patriasoul-example/patriasoul-example.php',
        'description' => 'Kratak opis namjene.',
        'stage' => 'U razvoju',
    );
    return $modules;
});
```

Ovo dodaje prikaz u pregled modula, ali samo po sebi ne implementira funkcionalnost. Svaki modul mora imati vlastiti kod i provjere.

## Trenutačno stanje

Pregled modula i ugovor za proširenja predstavljaju temelj arhitekture. Kviz, forum i mediji nisu ovim korakom migrirani; svaki će se razvijati i testirati kao zasebna faza. Postojeća aplikacija ostaje izvor funkcionalnosti dok WordPress zamjena ne prođe provjere.
