# Realtime: privatne poruke i obavijesti

Aplikacija sada sluša Supabase Realtime događaje za:
- nove privatne poruke poslane ili primljene prijavljenom članu
- nove obavijesti primatelja
- promjene stanja pročitanosti obavijesti

## Preduvjeti

Ovo je priprema za zasebnu **testnu** Supabase bazu. Ne pokretati u produkciji bez pregleda sheme, RLS pravila i odobrenja. Ovaj dokument ne mijenja nijednu bazu.

Tablice `public.private_messages` i `public.notifications` moraju postojati, a Realtime mora biti omogućen za njih u publikaciji `supabase_realtime`. RLS pravila i dalje moraju ograničavati pristup porukama sudionicima razgovora, a obavijesti samo primatelju.

## Pregledni SQL nacrt

Blok u nastavku dodaje tablice u publikaciju samo ako publikacija postoji i tablica još nije član publikacije. Pregledati prije ručnog izvršavanja u testnom projektu.

```sql
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if to_regclass('public.private_messages') is not null
       and not exists (
         select 1 from pg_publication_tables
         where pubname = 'supabase_realtime'
           and schemaname = 'public'
           and tablename = 'private_messages'
       ) then
      execute 'alter publication supabase_realtime add table public.private_messages';
    end if;

    if to_regclass('public.notifications') is not null
       and not exists (
         select 1 from pg_publication_tables
         where pubname = 'supabase_realtime'
           and schemaname = 'public'
           and tablename = 'notifications'
       ) then
      execute 'alter publication supabase_realtime add table public.notifications';
    end if;
  else
    raise notice 'Publikacija supabase_realtime ne postoji; provjeri postavke projekta.';
  end if;
end
$$;
```

## Sigurnosne napomene

- Ne uklanjati RLS niti proširivati pravila čitanja radi Realtime funkcionalnosti.
- Realtime je dodatni kanal dostave događaja, a ne zamjena za autorizaciju u bazi.
- Ako tablice ili pravila nisu postavljeni, UI funkcije neće biti dostupne dok se testna shema ne pripremi.
- Ne koristiti servisni ključ u pregledniku.
