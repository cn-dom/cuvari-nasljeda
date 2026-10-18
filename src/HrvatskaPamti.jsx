import { useState } from "react";
import "./HrvatskaPamti.css";
import HrvatskaPamtiMap from "./HrvatskaPamtiMap.jsx";
import SiteChrome from "./SiteChrome.jsx";

const places = [
  { name: "Vukovar", region: "Istočna Hrvatska", text: "Grad na Dunavu čuva sjećanje na obranu, izgubljene živote, obitelji koje su čekale i povratak života nakon razaranja.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Škabrnja", region: "Dalmacija", text: "Mjesto tuge i dostojanstva, gdje se iza svake brojke pamti čovjek, obitelj i prekinuti život.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Dubrovnik", region: "Južna Hrvatska", text: "Grad čije su zidine i domovi ranjeni ratom, a čija je obnova postala svjedočanstvo ustrajnosti.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Lika i Krbava", region: "Gorska Hrvatska", text: "Krajolik obiteljskih korijena, raseljenih sudbina, povrataka i priča koje se čuvaju od zaborava.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Zagreb", region: "Središnja Hrvatska", text: "Grad dvaju brežuljaka koji se kroz stoljeća obnavljao, mijenjao i čuvao tragove svojih stanovnika.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Knin", region: "Dalmatinsko zaleđe", text: "Kamena tvrđava i grad u kojem se susreću stoljetna povijest, državna simbolika i osobna sjećanja.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Osijek", region: "Istočna Hrvatska", text: "Grad na Dravi koji je u ratnim godinama čuvao domove, ulice i nadu svojih stanovnika.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
  { name: "Sinj", region: "Dalmatinsko zaleđe", text: "Mjesto gdje se zavjet, vještina i ponos Cetinske krajine prenose iz naraštaja u naraštaj.", status: "Radni zapis · provjera u tijeku", symbol: "✦" },
];

const collections = [
  { icon: "⌖", number: "01", title: "Karta sjećanja", copy: "Mjesta sjećanja povezana s ljudima, događajima i dokumentima — kako nijedna priča ne bi ostala sama.", tag: "ISTRAŽI MJESTA" },
  { icon: "🕯", number: "02", title: "Upali svijeću", copy: "Zastani na trenutak, zapali simboličnu svijeću i posveti tišinu onima kojih se sjećamo.", tag: "ODAJ POČAST" },
  { icon: "◷", number: "03", title: "Priče kroz vrijeme", copy: "Povijesni događaji kroz vrijeme, dokumente i svjedočanstva koja se čuvaju uz poštovanje i provjeru.", tag: "UPOZNAJ PRIČE" },
  { icon: "✧", number: "04", title: "Stratišta i grobišta", copy: "Mjesta stradanja i grobišta obrađivat će se pažljivo, uz razlikovanje potvrđenih podataka, procjena i nepoznanica.", tag: "SAČUVAJ SJEĆANJE" },
  { icon: "⌂", number: "05", title: "Korijeni i baština", copy: "Fotografije, prezimena, običaji i obiteljske uspomene koje pomažu budućim naraštajima pronaći svoje korijene.", tag: "OTKRIJ KORIJENE" },
  { icon: "▤", number: "06", title: "Izvori i dokumenti", copy: "Svaka važna tvrdnja treba imati trag do dokumenta, ustanove ili stručnog istraživanja.", tag: "PROVJERI IZVORE" },
];

export default function HrvatskaPamti() {
  const [selectedPlace, setSelectedPlace] = useState(places[0]);
  const [candleLit, setCandleLit] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const filteredPlaces = places.filter((place) => (place.name + " " + place.region + " " + place.text).toLocaleLowerCase("hr").includes(placeQuery.trim().toLocaleLowerCase("hr")));
  return <main className="hp-page">
    <SiteChrome section="Domovina" links={[{"label":"Karta sjećanja","href":"#karta"},{"label":"Povijesne priče","href":"#price"},{"label":"Izvori i načela","href":"#izvori"},{"label":"Registar grobišta","href":"/hrvatska-pamti-grobnice.html"}]}/>
    
    <section className="hp-hero">
      <div className="hp-hero-shade" />
      <div className="hp-hero-content">
        <div className="hp-eyebrow"><span /> DIGITALNI SPOMENIK HRVATSKE <span /></div>
        <h1>Hrvatska<br /><em>pamti.</em></h1>
        <p className="hp-hero-lead">Imena. Mjesta. Sudbine. Sjećanje koje se prenosi.</p>
        <p className="hp-hero-copy">Ovdje čuvamo tragove ljudi i mjesta koja su oblikovala Hrvatsku. Ne da bismo ostali zarobljeni u prošlosti, nego da bismo razumjeli što su naraštaji prije nas proživjeli, što su sačuvali i što imamo obvezu prenijeti dalje. Svaka priča zaslužuje dostojanstvo, a svaka tvrdnja — izvor.</p>
        <a className="hp-primary-cta" href="#karta">Istraži kartu sjećanja <span>↗</span></a>
        <div className="hp-hero-note"><span>✦</span> U znak poštovanja prema žrtvama i svima koji čuvaju istinu.</div>
      </div>
      <div className="hp-hero-vertical">HRVATSKA · PAMĆENJE · DOSTOJANSTVO</div>
      <div className="hp-hero-bottom"><span>VJERA · OBITELJ · DOMOVINA</span><span>01 / SJEĆANJE</span></div>
    </section>
    <section className="hp-intro">
      <div><span className="hp-section-kicker">ZA ONE KOJI DOLAZE</span><h2>Prošlost ne smije<br />ostati bez <em>glasa.</em></h2></div>
      <p>Ovo nije popis bezličnih datuma. To je mjesto za ljude koji su voljeli svoj dom, za obitelji koje su sačuvale fotografiju, pismo ili sjećanje, za mjesta koja su preživjela razaranja i za baštinu koja se prenosi dalje. Sjećanje ne smije zamijeniti činjenice, a činjenice ne smiju izbrisati ljudsku bol. Zato svaki zapis gradimo pažljivo, uz provjeru i jasno navođenje izvora.</p>
    </section>
    <section className="hp-map-section" id="karta">
      <div className="hp-section-heading"><div><span className="hp-section-kicker">ISTRAŽI PROSTOR SJEĆANJA</span><h2>Karta <em>sjećanja</em></h2></div><p>Odaberi mjesto na karti. Upoznaj njegovu povijest, zastani uz ljudske priče i otkrij dokumente koji pomažu sačuvati sjećanje.</p></div>
      <div className="hp-place-search" role="search"><label htmlFor="hp-place-query">Pronađi mjesto ili regiju</label><input id="hp-place-query" type="search" value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} placeholder="Npr. Vukovar, Dalmacija, baština…" /><span>{filteredPlaces.length} {filteredPlaces.length === 1 ? "mjesto" : "mjesta"}</span></div>
      {placeQuery.trim() && <div className="hp-place-results" aria-live="polite">{filteredPlaces.length ? filteredPlaces.map((place) => <button type="button" key={place.name} className={selectedPlace.name === place.name ? "active" : ""} onClick={() => setSelectedPlace(place)}><span>{place.region}</span><strong>{place.name}</strong><small>Odaberi mjesto ↗</small></button>) : <p>Nema rezultata. Pokušaj upisati naziv grada ili regije.</p>}</div>}
      <div className="hp-map-layout">
        <HrvatskaPamtiMap places={places} selectedPlace={selectedPlace} onSelect={setSelectedPlace} />
        <aside className="hp-place-panel" aria-live="polite" aria-label={"Odabrano mjesto: " + selectedPlace.name}>
          <span className="hp-section-kicker">ODABRANO MJESTO</span>
          <span className="hp-place-symbol" aria-hidden="true">{selectedPlace.symbol}</span>
          <span className="hp-place-region">{selectedPlace.region}</span>
          <h3>{selectedPlace.name}</h3>
          <p>{selectedPlace.text}</p>
          <span className="hp-place-status">{selectedPlace.status}</span>
          <a className="hp-place-open" href={"/hrvatska-pamti-mjesto.html?mjesto=" + ({"Vukovar":"vukovar","Škabrnja":"skabrnja","Dubrovnik":"dubrovnik","Lika i Krbava":"lika-i-krbava","Zagreb":"zagreb","Knin":"knin","Osijek":"osijek","Sinj":"sinj"}[selectedPlace.name] || "vukovar")}>Otvori stranicu mjesta <span>↗</span></a>
          <div className="hp-source-note">
            <strong>Što slijedi?</strong>
            <p>Ovaj je dosje početna urednička obrada. Sljedeći koraci su provjera konkretnih dokumenata, potvrda podataka o lokaciji i pažljivo povezivanje izvora sa svakom važnom tvrdnjom.</p>
          </div>
        </aside>
      </div>
      <p className="hp-map-disclaimer">Ovo je početni vizualni pregled, a ne geografski precizna karta. Povijesni zapisi i lokacije neće se prikazivati kao potvrđeni dok se ne provjere izvori.</p>
    </section>
    <section className="hp-collections" id="price">
      <div className="hp-section-heading"><div><span className="hp-section-kicker">JEDNO SJEĆANJE · MNOGO PRIČA</span><h2>Čuvamo ono što<br /><em>ne smijemo zaboraviti.</em></h2></div><p>Jedna obitelj čuva fotografiju. Jedno mjesto čuva spomen. Jedan dokument rasvjetljava događaj. Kada ih povežemo, povijest postaje bliža i razumljivija.</p></div>
      <div className="hp-collection-grid">{collections.map((item) => <article className="hp-collection-card" key={item.number}><div className="hp-card-top"><span className="hp-card-icon">{item.icon}</span><span className="hp-card-number">{item.number}</span></div><h3>{item.title}</h3><p>{item.copy}</p><a href={item.number === "01" ? "#karta" : item.number === "02" ? "#svijeca" : item.number === "04" ? "/hrvatska-pamti-grobnice.html" : "#izvori"}>{item.tag} <span>↗</span></a></article>)}</div>
    </section>
    <section className="hp-candle-section" id="svijeca">
      <div className="hp-candle-art"><div className={candleLit ? "hp-flame lit" : "hp-flame"} /><div className="hp-candle-glow" /><div className="hp-candle-body"><span>✦</span></div><div className="hp-candle-reflection" /></div>
      <div className="hp-candle-copy"><span className="hp-section-kicker">TRENUTAK TIŠINE</span><h2>Jedna svijeća.<br /><em>Jedno sjećanje.</em></h2><p>U znak poštovanja, zastani na trenutak. Ova demonstracija prikazuje simbolično paljenje svijeće samo na ovom uređaju — ne sprema javnu počast niti je šalje u bazu podataka.</p><button type="button" className={candleLit ? "hp-candle-button lit" : "hp-candle-button"} onClick={() => setCandleLit((value) => !value)}>{candleLit ? "Svijeća gori · ugasi" : "🕯 Upali svijeću"}</button><small>{candleLit ? "Neka sjećanje ostane živo." : "Bez natjecanja. Bez ljestvica. Samo sjećanje."}</small></div>
    </section>
    <section className="hp-principles" id="izvori"><span className="hp-section-kicker">POVIJEST ZASLUŽUJE ODGOVORNOST</span><h2>Dostojanstvo u sjećanju.<br /><em>Istina u svakom zapisu.</em></h2><div className="hp-principle-grid"><article><span>01</span><h3>Izvori prije tvrdnji</h3><p>Arhivi, muzeji, znanstvena literatura i službeni registri imaju prednost pred neprovjerenim objavama.</p></article><article><span>02</span><h3>Jasno što znamo</h3><p>Činjenice, procjene, svjedočanstva, predaje i otvorena istraživanja bit će jasno razdvojeni.</p></article><article><span>03</span><h3>Bez izmišljanja</h3><p>Nijedno ime, broj žrtava, mjesto grobišta ili citat neće biti predstavljen kao potvrđen bez provjere.</p></article></div></section>
    <section className="hp-research-process" aria-labelledby="hp-research-process-title">
      <div className="hp-research-process-intro"><span className="hp-section-kicker">OD DOKUMENTA DO SJEĆANJA</span><h2 id="hp-research-process-title">Svaka priča prolazi<br/><em>put provjere.</em></h2><p>Ne želimo samo prikupiti sadržaj. Želimo znati odakle dolazi, što doista potvrđuje i smijemo li ga sačuvati i podijeliti.</p></div>
      <div className="hp-research-steps">
        <article><span>01</span><div><h3>Pronaći trag</h3><p>Utvrditi naziv dokumenta, ustanovu, autora ili stvaratelja, datum i kontekst nastanka.</p></div></article>
        <article><span>02</span><div><h3>Provjeriti navod</h3><p>Usporediti tvrdnju s izvornom građom i drugim vjerodostojnim izvorima kad je to moguće.</p></div></article>
        <article><span>03</span><div><h3>Sačuvati ljudski glas</h3><p>Svjedočanstva jasno označiti, provjeriti suglasnost i zaštititi osjetljive osobne podatke.</p></div></article>
        <article><span>04</span><div><h3>Objaviti odgovorno</h3><p>Naznačiti što je potvrđeno, što je svjedočenje, a što još zahtijeva istraživanje — i ispraviti zapis ako se pojave novi dokazi.</p></div></article>
      </div>
    </section>
    <section className="hp-source-library" aria-labelledby="hp-source-library-title">
      <div className="hp-source-library-heading"><span className="hp-section-kicker">POČETNE TOČKE ZA ISTRAŽIVANJE</span><h2 id="hp-source-library-title">Istraživanje počinje<br /><em>vjerodostojnim izvorom.</em></h2><p>Iza svakog zapisa stoji odgovornost. Službene evidencije, arhivski dokumenti i stručna istraživanja služe kao polazište, a ne kao dopuštenje za nagađanje. Podatak o mogućem grobištu ili nestaloj osobi nikada nećemo pretvarati u senzacionalističku objavu.</p></div>
      <div className="hp-source-library-grid">
        <article><span className="hp-source-library-number">01 · ARHIVSKA GRAĐA</span><h3>Hrvatski državni arhiv</h3><p>Pretraživanje fondova i zbirki te vodiči za rad s izvornom arhivskom građom.</p><span className="hp-source-library-action">Arhivski izvor · bibliografski zapis u pripremi</span></article>
        <article><span className="hp-source-library-number">02 · DIGITALNA BAŠTINA</span><h3>Portal eKultura</h3><p>Digitalizirane zbirke muzeja, knjižnica i arhiva u Hrvatskoj, pretražive prema temi, vremenu i vrsti građe.</p><span className="hp-source-library-action">Digitalna zbirka · bibliografski zapis u pripremi</span></article>
        <article><span className="hp-source-library-number">03 · NESTALE OSOBE</span><h3>Traženje i identifikacija</h3><p>Nadležna državna uprava prikuplja i obrađuje saznanja o nestalima, vodi evidencije te sudjeluje u ekshumacijama, identifikacijama i dostojnom ukopu pronađenih posmrtnih ostataka. Svaki podatak o osobi ili mogućem mjestu grobišta mora se provjeriti i proslijediti nadležnim stručnjacima.</p><span className="hp-source-library-action">Izvor: Ministarstvo hrvatskih branitelja · Uprava za zatočene i nestale</span></article>
        <article><span className="hp-source-library-number">04 · ŽRTVE RATA I PORAĆA</span><h3>Dostojanstvo svakog groba</h3><p>Hrvatski propisi uređuju istraživanje, uređenje i održavanje vojnih groblja, groblja žrtava Drugoga svjetskog rata i poslijeratnog razdoblja. Na ovoj platformi povijesni opis neće zamijeniti stručnu istragu: mjesto, datacija, identitet i okolnosti stradanja označavat će se prema stupnju potvrđenosti.</p><span className="hp-source-library-action">Izvor: Ministarstvo hrvatskih branitelja · službene informacije o žrtvama Drugoga svjetskog rata i poslijeratnog razdoblja</span></article>
      </div>
      <p className="hp-source-library-note">Fotografije i dokumenti neće se preuzimati niti ponovno objavljivati bez provjere uvjeta korištenja, autorstva i prava. Osjetljivi podaci o obiteljima, svjedocima i mogućim mjestima ukopa neće se objavljivati na način koji može ugroziti privatnost ili stručni rad nadležnih službi.</p>
    </section>
    
  </main>;
}
