import { useState } from "react";
import "./HrvatskaPamti.css";
import HrvatskaPamtiMap from "./HrvatskaPamtiMap.jsx";

const places = [
  { name: "Vukovar", region: "Istočna Hrvatska", text: "Sjećanje na obranu grada, stradanje civila i branitelja te povratak života.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Škabrnja", region: "Dalmacija", text: "Mjesto sjećanja na civilne žrtve i branitelje iz studenoga 1991.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Dubrovnik", region: "Južna Hrvatska", text: "Obrana grada i očuvanje kulturne baštine tijekom napada 1991.–1992.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Lika i Krbava", region: "Središnja Hrvatska", text: "Prostor brojnih povijesnih slojeva, stradanja i obiteljskih sjećanja.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Zagreb", region: "Središnja Hrvatska", text: "Glavni grad i mjesto susreta različitih razdoblja hrvatske političke, kulturne i društvene povijesti.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Knin", region: "Dalmatinsko zaleđe", text: "Povijesni grad povezan s hrvatskom državnom tradicijom i događajima novije povijesti.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Osijek", region: "Istočna Hrvatska", text: "Grad na Dravi s bogatom urbanom baštinom i važnim pričama iz novije hrvatske povijesti.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Sinj", region: "Dalmatinsko zaleđe", text: "Grad snažne lokalne tradicije, poznat po Sinjskoj alci i baštini Cetinske krajine.", status: "Priprema sadržaja", symbol: "✦" },
];

const collections = [
  { icon: "⌖", number: "01", title: "Karta sjećanja", copy: "Mjesta, događaji i spomen-obilježja povezana na jednoj interaktivnoj karti.", tag: "ISTRAŽI MJESTA" },
  { icon: "🕯", number: "02", title: "Upali svijeću", copy: "Tiho, dostojanstveno digitalno sjećanje bez natjecanja i rangiranja.", tag: "ODAJ POČAST" },
  { icon: "◷", number: "03", title: "Priče kroz vrijeme", copy: "Vremenske crte, fotografije, dokumenti i svjedočanstva s navedenim izvorima.", tag: "UPOZNAJ PRIČE" },
  { icon: "✧", number: "04", title: "Stratišta i grobišta", copy: "Dokumentiranje mjesta stradanja uz jasno označene činjenice, procjene i nepoznanice.", tag: "SAČUVAJ SJEĆANJE" },
  { icon: "⌂", number: "05", title: "Korijeni i baština", copy: "Obiteljske priče, lokalna tradicija i nasljeđe koje se prenosi naraštajima.", tag: "OTKRIJ KORIJENE" },
  { icon: "▤", number: "06", title: "Izvori i dokumenti", copy: "Arhivska građa i pouzdani izvori uz svaku povijesnu tvrdnju.", tag: "PROVJERI IZVORE" },
];

export default function HrvatskaPamti() {
  const [selectedPlace, setSelectedPlace] = useState(places[0]);
  const [candleLit, setCandleLit] = useState(false);
  return <main className="hp-page">
    <header className="hp-topline">
      <a className="hp-brand" href="/" aria-label="Povratak na PatriaSoul"><img src="/assets/images/1000000982.png" alt="" /><span>PatriaSoul <small>ČUVARI NASLJEĐA</small></span></a>
      <nav aria-label="Navigacija Hrvatske pamti"><a href="#karta">Karta sjećanja</a><a href="#price">Povijesne priče</a><a href="#izvori">Izvori i načela</a><a className="hp-return" href="/">← Povratak u zajednicu</a></nav>
    </header>
    <section className="hp-hero">
      <div className="hp-hero-shade" />
      <div className="hp-hero-content">
        <div className="hp-eyebrow"><span /> DIGITALNI SPOMENIK HRVATSKE <span /></div>
        <h1>Hrvatska<br /><em>pamti.</em></h1>
        <p className="hp-hero-lead">Imena. Mjesta. Sudbine. Sjećanje koje se prenosi.</p>
        <p className="hp-hero-copy">Prostor posvećen ljudima, događajima i mjestima koja su obilježila hrvatsku povijest. Svaka priča zaslužuje dostojanstvo, a svaka tvrdnja — izvor.</p>
        <a className="hp-primary-cta" href="#karta">Istraži kartu sjećanja <span>↗</span></a>
        <div className="hp-hero-note"><span>✦</span> U znak poštovanja prema žrtvama i svima koji čuvaju istinu.</div>
      </div>
      <div className="hp-hero-vertical">HRVATSKA · PAMĆENJE · DOSTOJANSTVO</div>
      <div className="hp-hero-bottom"><span>VJERA · OBITELJ · DOMOVINA</span><span>01 / SJEĆANJE</span></div>
    </section>
    <section className="hp-intro">
      <div><span className="hp-section-kicker">ZA ONE KOJI DOLAZE</span><h2>Prošlost ne smije<br />ostati bez <em>glasa.</em></h2></div>
      <p>Ovo nije popis bezličnih datuma. Ovo je živi digitalni prostor u kojem se mjesta povezuju s ljudima, dokumenti s pričama, a sjećanje s odgovornošću. Sadržaj se objavljuje postupno, uz provjeru i jasno navođenje izvora.</p>
    </section>
    <section className="hp-map-section" id="karta">
      <div className="hp-section-heading"><div><span className="hp-section-kicker">ISTRAŽI PROSTOR SJEĆANJA</span><h2>Karta <em>sjećanja</em></h2></div><p>Odaberi mjesto i upoznaj priče koje će biti dokumentirane uz provjerljive izvore.</p></div>
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
            <p>Priprema povijesnog zapisa, provjera lokacije i povezivanje s pouzdanim arhivskim, muzejskim ili znanstvenim izvorima.</p>
          </div>
        </aside>
      </div>
      <p className="hp-map-disclaimer">Ovo je početni vizualni pregled, a ne geografski precizna karta. Povijesni zapisi i lokacije neće se prikazivati kao potvrđeni dok se ne provjere izvori.</p>
    </section>
    <section className="hp-collections" id="price">
      <div className="hp-section-heading"><div><span className="hp-section-kicker">JEDNO SJEĆANJE · MNOGO PRIČA</span><h2>Čuvamo ono što<br /><em>ne smijemo zaboraviti.</em></h2></div><p>Svaka zbirka imat će svoj prostor, ali će se sve povezivati kroz ljude, mjesta i povijesne događaje.</p></div>
      <div className="hp-collection-grid">{collections.map((item) => <article className="hp-collection-card" key={item.number}><div className="hp-card-top"><span className="hp-card-icon">{item.icon}</span><span className="hp-card-number">{item.number}</span></div><h3>{item.title}</h3><p>{item.copy}</p><a href={item.number === "01" ? "#karta" : item.number === "02" ? "#svijeca" : "#izvori"}>{item.tag} <span>↗</span></a></article>)}</div>
    </section>
    <section className="hp-candle-section" id="svijeca">
      <div className="hp-candle-art"><div className={candleLit ? "hp-flame lit" : "hp-flame"} /><div className="hp-candle-glow" /><div className="hp-candle-body"><span>✦</span></div><div className="hp-candle-reflection" /></div>
      <div className="hp-candle-copy"><span className="hp-section-kicker">TRENUTAK TIŠINE</span><h2>Jedna svijeća.<br /><em>Jedno sjećanje.</em></h2><p>U znak poštovanja, zastani na trenutak. Ova demonstracija prikazuje simbolično paljenje svijeće samo na ovom uređaju — ne sprema javnu počast niti je šalje u bazu podataka.</p><button type="button" className={candleLit ? "hp-candle-button lit" : "hp-candle-button"} onClick={() => setCandleLit((value) => !value)}>{candleLit ? "Svijeća gori · ugasi" : "🕯 Upali svijeću"}</button><small>{candleLit ? "Neka sjećanje ostane živo." : "Bez natjecanja. Bez ljestvica. Samo sjećanje."}</small></div>
    </section>
    <section className="hp-principles" id="izvori"><span className="hp-section-kicker">POVIJEST ZASLUŽUJE ODGOVORNOST</span><h2>Dostojanstvo u sjećanju.<br /><em>Istina u svakom zapisu.</em></h2><div className="hp-principle-grid"><article><span>01</span><h3>Izvori prije tvrdnji</h3><p>Arhivi, muzeji, znanstvena literatura i službeni registri imaju prednost pred neprovjerenim objavama.</p></article><article><span>02</span><h3>Jasno što znamo</h3><p>Činjenice, procjene, svjedočanstva, predaje i otvorena istraživanja bit će jasno razdvojeni.</p></article><article><span>03</span><h3>Bez izmišljanja</h3><p>Nijedno ime, broj žrtava, mjesto grobišta ili citat neće biti predstavljen kao potvrđen bez provjere.</p></article></div></section>
    <footer className="hp-footer"><a className="hp-brand" href="/"><img src="/assets/images/1000000982.png" alt="" /><span>PatriaSoul <small>ČUVARI NASLJEĐA</small></span></a><p>Hrvatska pamti — digitalni prostor sjećanja i odgovornog istraživanja.</p><a href="/">Povratak na PatriaSoul ↗</a></footer>
  </main>;
}
