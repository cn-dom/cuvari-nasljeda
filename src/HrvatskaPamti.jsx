import { useState } from "react";
import "./HrvatskaPamti.css";

const places = [
  { name: "Vukovar", region: "Istočna Hrvatska", text: "Sjećanje na obranu grada, stradanje civila i branitelja te povratak života.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Škabrnja", region: "Dalmacija", text: "Mjesto sjećanja na civilne žrtve i branitelje iz studenoga 1991.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Dubrovnik", region: "Južna Hrvatska", text: "Obrana grada i očuvanje kulturne baštine tijekom napada 1991.–1992.", status: "Priprema sadržaja", symbol: "✦" },
  { name: "Lika i Krbava", region: "Središnja Hrvatska", text: "Prostor brojnih povijesnih slojeva, stradanja i obiteljskih sjećanja.", status: "Priprema sadržaja", symbol: "✦" },
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
        <div className="hp-map-art" role="img" aria-label="Stilizirani prikaz hrvatskih povijesnih regija">
          <div className="hp-map-grid" /><div className="hp-map-contour contour-one" /><div className="hp-map-contour contour-two" />
          <svg className="hp-croatia-shape" viewBox="0 0 360 440" aria-hidden="true"><path d="M73 31 L112 43 L137 67 L159 79 L173 104 L202 114 L218 137 L246 148 L251 170 L282 187 L291 208 L271 218 L255 205 L239 219 L223 241 L205 251 L185 244 L169 261 L150 276 L132 267 L117 247 L96 233 L84 210 L64 195 L55 171 L35 158 L46 141 L64 135 L58 114 L74 101 L65 81 L84 67 Z" /><path d="M115 247 L139 264 L158 286 L182 300 L203 316 L226 325 L245 346 L266 359 L283 383 L270 398 L249 380 L232 362 L211 352 L192 335 L174 328 L151 310 L135 293 L120 275 Z" /></svg>
          {places.map((place, i) => <button key={place.name} type="button" className={selectedPlace.name === place.name ? "hp-map-pin selected" : "hp-map-pin"} style={{ "--pin-x": ["52%","39%","67%","43%"][i], "--pin-y": ["29%","51%","75%","62%"][i] }} onClick={() => setSelectedPlace(place)} aria-label={"Odaberi " + place.name}><span>✦</span></button>)}
          <div className="hp-map-caption"><span className="hp-map-live-dot" /> DIGITALNI ATLAS SJEĆANJA <small>POČETNI PREGLED</small></div>
        </div>
        <div className="hp-place-panel"><span className="hp-section-kicker">ODABRANO PODRUČJE</span><span className="hp-place-symbol">{selectedPlace.symbol}</span><span className="hp-place-region">{selectedPlace.region}</span><h3>{selectedPlace.name}</h3><p>{selectedPlace.text}</p><div className="hp-place-status">{selectedPlace.status}</div><div className="hp-source-note"><strong>Načelo izvora</strong><p>Svaki budući zapis sadržavat će izvor, datum provjere i oznaku pouzdanosti podataka.</p></div></div>
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
