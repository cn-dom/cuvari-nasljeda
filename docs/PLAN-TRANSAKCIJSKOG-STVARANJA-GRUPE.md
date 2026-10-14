# Plan popravka: sigurno stvaranje grupnog razgovora

**Status:** plan za implementaciju; nije migracija i nije primijenjen na Supabase.

## Zašto je potrebno

Trenutačni tok u `src/App.jsx` radi odvojene upise u `group_chats`, `group_chat_members` za osnivača i `group_chat_members` za pozvane članove. Ako kasniji upis ne uspije, raniji ostaju spremljeni. Korisnik može dobiti djelomično stvorenu grupu.

## Cilj

Jedan poziv iz sučelja treba stvoriti grupu, dodati osnivača kao administratora i dodati odabrane članove u jednoj PostgreSQL transakciji. Ako bilo koji korak ne uspije, baza mora vratiti cijelu operaciju unatrag.

## Predloženi RPC ugovor

- Naziv: `create_group_chat_with_members`
- Ulazi: `p_name text`, `p_member_ids uuid[]`
- Identitet osnivača: samo `auth.uid()`; sučelje ne smije moći proslijediti tuđi ID kao osnivača.
- Izlaz: ID novostvorene grupe (UUID).
- Funkcija mora odbiti neprijavljene pozive, prazan/predugačak naziv, nevaljane ili duplicirane članove i pozivanje samog osnivača kao običnog člana.
- Prije dodavanja pozvanih članova provjeriti da svi korisnički ID-jevi postoje i da ih pravila aplikacije dopuštaju dodati.
- Stvoriti grupu, dodati osnivača s ulogom `admin` i dodati pozvane članove s ulogom `member` u istoj transakciji.
- Dodijeliti `EXECUTE` samo ulozi `authenticated`; ne oslanjati se samo na grantove, nego provjeravati identitet i ovlasti unutar funkcije.
- Ako je `SECURITY DEFINER` potreban, postaviti siguran `search_path`, kvalificirati tablice shemom `public` i pregledati sve putove ovlasti prije primjene.

## Promjena u sučelju nakon što migracija bude testirana i primijenjena

U `createGroupChat(event)` zamijeniti tri odvojena upisa jednim pozivom:

```js
const { data: groupId, error } = await supabase.rpc(
  "create_group_chat_with_members",
  {
    p_name: name,
    p_member_ids: selectedMemberIds,
  }
);
if (error) throw error;
```

Nazive lokalnih varijabli treba uskladiti sa stvarnim kodom. Nakon uspjeha ponovno dohvatiti popis grupa i otvoriti stvorenu grupu. Nakon pogreške prikazati jednu jasnu poruku; ne prikazivati da je grupa stvorena.

## Obavezni testovi prije produkcije

1. Stvaranje grupe bez dodatnih članova.
2. Stvaranje grupe s više članova.
3. Neprijavljeni poziv odbijen.
4. Prazan naziv odbijen.
5. Nevaljan ili nedopušten ID člana odbijen.
6. Namjerno izazvana pogreška pri dodavanju člana ne ostavlja grupu ni članstva.
7. Osnivač je nakon uspjeha admin, a pozvani članovi su obični članovi.
8. Korisnik ne može preko parametara proglasiti drugog korisnika osnivačem ili administratorom.
9. Postojeće grupe, poruke, čitanja i RLS pravila nastavljaju raditi.

## Odvojeni sigurnosni problem

Ovaj popravak **ne rješava** mogućnost ponovnog dobivanja administratorske uloge na temelju trajnog `created_by` nakon prijenosa ovlasti ili izlaska iz grupe. To treba zasebno riješiti i testirati s pravilima `group_chat_members` i funkcijama prijenosa/izlaska, bez pretpostavke da je sama RPC funkcija dovoljna.

## Sigurnost primjene

Ovaj dokument ne mijenja bazu ni aplikaciju. Prije pisanja i primjene migracije treba provjeriti stvarnu definiciju tablica, ograničenja, RLS pravila i postojeće trigger-e na izoliranom testnom projektu. Produkcijska migracija nije pokrenuta.
